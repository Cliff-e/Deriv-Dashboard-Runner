import React, { useEffect, useRef, useState } from "react";

const DERIV_WS = "wss://ws.derivws.com/websockets/v3";

const AiBots = () => {
    // SETTINGS
    const [digits, setDigits] = useState("2,1,8,0");
    const [baseStake, setBaseStake] = useState(1);
    const [martingale, setMartingale] = useState(true);
    const [martingaleFactor, setMartingaleFactor] = useState(2);
    const [targetProfit, setTargetProfit] = useState(10);
    const [stopLoss, setStopLoss] = useState(5);
    const [recoveryType, setRecoveryType] = useState("under");
    const [recoveryBarrier, setRecoveryBarrier] = useState(4);

    const [running, setRunning] = useState(false);

    // MARKETS (REAL DERIV STRUCTURE)
    const markets = [
        "Volatility 10 Index",
        "Volatility 25 Index",
        "Volatility 50 Index",
        "Volatility 75 Index",
        "Volatility 100 Index",
        "Volatility 10 (1s) Index",
        "Volatility 25 (1s) Index",
        "Volatility 50 (1s) Index",
        "Volatility 75 (1s) Index",
        "Volatility 100 (1s) Index",
        "EURUSD",
        "GBPUSD",
        "USDJPY"
    ];

    const [market, setMarket] = useState(markets[0]);
    const [autoMarket, setAutoMarket] = useState(true);

    // LIVE TICK STORAGE
    const tickData = useRef<Record<string, number[]>>({});
    const ws = useRef<WebSocket | null>(null);

    // CONNECT DERIV
    const connectWS = () => {
        ws.current = new WebSocket(DERIV_WS);

        ws.current.onopen = () => {
            console.log("Connected to Deriv");

            markets.forEach(symbol => {
                ws.current?.send(
                    JSON.stringify({
                        ticks: symbol,
                        subscribe: 1
                    })
                );
            });
        };

        ws.current.onmessage = (msg) => {
            const data = JSON.parse(msg.data);

            if (data.tick) {
                const symbol = data.tick.symbol;
                const price = data.tick.quote;

                if (!tickData.current[symbol]) {
                    tickData.current[symbol] = [];
                }

                tickData.current[symbol].push(price);

                if (tickData.current[symbol].length > 20) {
                    tickData.current[symbol].shift();
                }
            }
        };
    };

    // AI MARKET SELECTOR
    const selectBestMarket = () => {
        let best = markets[0];
        let bestScore = -Infinity;

        for (const m of markets) {
            const ticks = tickData.current[m] || [];

            if (ticks.length < 5) continue;

            let volatility = 0;

            for (let i = 1; i < ticks.length; i++) {
                volatility += Math.abs(ticks[i] - ticks[i - 1]);
            }

            let score = volatility;

            if (m.includes("(1s)")) score += 50;

            if (score > bestScore) {
                bestScore = score;
                best = m;
            }
        }

        return best;
    };

    // START BOT
    const startBot = () => {
        const parsedDigits = digits.split(",").map(d => Number(d.trim()));

        const selectedMarket = autoMarket
            ? selectBestMarket()
            : market;

        console.log("🚀 BOT STARTED");
        console.log({
            selectedMarket,
            parsedDigits,
            baseStake,
            martingale,
            martingaleFactor,
            targetProfit,
            stopLoss,
            recoveryType,
            recoveryBarrier
        });

        setRunning(true);
    };

    const stopBot = () => {
        console.log("🛑 BOT STOPPED");
        setRunning(false);
    };

    useEffect(() => {
        connectWS();
        return () => ws.current?.close();
    }, []);

    return (
        <div style={styles.container}>
            <h2>AI Cycle Bot (Deriv Live)</h2>

            {/* MARKET SELECT */}
            <div style={styles.group}>
                <label>
                    <input
                        type="checkbox"
                        checked={autoMarket}
                        onChange={() => setAutoMarket(!autoMarket)}
                    />
                    Auto Market Selection (AI + Live Ticks)
                </label>

                {!autoMarket && (
                    <select
                        value={market}
                        onChange={e => setMarket(e.target.value)}
                        style={styles.select}
                    >
                        {markets.map(m => (
                            <option key={m} value={m} style={styles.option}>
                                {m}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* DIGITS */}
            <div style={styles.group}>
                <label>Cycle Digits</label>
                <input value={digits} onChange={e => setDigits(e.target.value)} />
            </div>

            {/* STAKE */}
            <div style={styles.group}>
                <label>Base Stake</label>
                <input
                    type="number"
                    value={baseStake}
                    onChange={e => setBaseStake(Number(e.target.value))}
                />
            </div>

            {/* MARTINGALE */}
            <div style={styles.group}>
                <label>
                    <input
                        type="checkbox"
                        checked={martingale}
                        onChange={() => setMartingale(!martingale)}
                    />
                    Martingale
                </label>

                {martingale && (
                    <input
                        type="number"
                        value={martingaleFactor}
                        onChange={e => setMartingaleFactor(Number(e.target.value))}
                    />
                )}
            </div>

            {/* RISK */}
            <div style={styles.group}>
                <label>Target Profit</label>
                <input
                    type="number"
                    value={targetProfit}
                    onChange={e => setTargetProfit(Number(e.target.value))}
                />
            </div>

            <div style={styles.group}>
                <label>Stop Loss</label>
                <input
                    type="number"
                    value={stopLoss}
                    onChange={e => setStopLoss(Number(e.target.value))}
                />
            </div>

            {/* RECOVERY */}
            <div style={styles.group}>
                <label>Recovery Type</label>
                <select
                    value={recoveryType}
                    onChange={e => setRecoveryType(e.target.value)}
                    style={styles.select}
                >
                    <option value="under">Under</option>
                    <option value="over">Over</option>
                </select>
            </div>

            <div style={styles.group}>
                <label>Recovery Barrier</label>
                <input
                    type="number"
                    value={recoveryBarrier}
                    onChange={e => setRecoveryBarrier(Number(e.target.value))}
                />
            </div>

            {/* BUTTONS */}
            <div style={styles.buttons}>
                {!running ? (
                    <button onClick={startBot}>▶ Start Bot</button>
                ) : (
                    <button onClick={stopBot}>⏹ Stop Bot</button>
                )}
            </div>
        </div>
    );
};

export default AiBots;

const styles = {
    container: {
        padding: 20,
        maxWidth: 500,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 15,
        background: "#111",
        color: "#fff",
        borderRadius: 10
    },
    group: {
        display: "flex",
        flexDirection: "column",
        gap: 5
    },
    buttons: {
        display: "flex",
        gap: 10
    },

    // 🔥 FIXED MARKET DROPDOWN STYLE
    select: {
        backgroundColor: "#111",
        color: "#00ff66",
        border: "1px solid #00ff66",
        padding: "8px",
        borderRadius: "6px",
        outline: "none"
    },

    option: {
        backgroundColor: "#111",
        color: "#00ff66"
    }
};