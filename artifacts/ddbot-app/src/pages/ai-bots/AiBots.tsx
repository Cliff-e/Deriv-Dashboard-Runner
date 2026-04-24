import React, { useState } from "react";

const AiBots = () => {
    // SETTINGS
    const [digits, setDigits] = useState("2,1,8,0");
    const [baseStake, setBaseStake] = useState(1);
    const [martingale, setMartingale] = useState(true);
    const [martingaleFactor, setMartingaleFactor] = useState(2);
    const [targetProfit, setTargetProfit] = useState(10);
    const [stopLoss, setStopLoss] = useState(5);
    const [recoveryType, setRecoveryType] = useState("under"); // under | over
    const [recoveryBarrier, setRecoveryBarrier] = useState(4);

    const [running, setRunning] = useState(false);

    // HANDLE START
    const startBot = () => {
        const parsedDigits = digits.split(",").map(d => Number(d.trim()));

        console.log("START BOT WITH:");
        console.log({
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
        console.log("STOP BOT");
        setRunning(false);
    };

    return (
        <div style={styles.container}>
            <h2>AI Cycle Bot</h2>

            {/* DIGITS */}
            <div style={styles.group}>
                <label>Cycle Digits (comma separated)</label>
                <input
                    value={digits}
                    onChange={e => setDigits(e.target.value)}
                    placeholder="e.g 2,1,8,0"
                />
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
                    Enable Martingale
                </label>

                {martingale && (
                    <input
                        type="number"
                        value={martingaleFactor}
                        onChange={e => setMartingaleFactor(Number(e.target.value))}
                        placeholder="Martingale Factor (e.g 2)"
                    />
                )}
            </div>

            {/* TARGET PROFIT */}
            <div style={styles.group}>
                <label>Target Profit</label>
                <input
                    type="number"
                    value={targetProfit}
                    onChange={e => setTargetProfit(Number(e.target.value))}
                />
            </div>

            {/* STOP LOSS */}
            <div style={styles.group}>
                <label>Stop Loss</label>
                <input
                    type="number"
                    value={stopLoss}
                    onChange={e => setStopLoss(Number(e.target.value))}
                />
            </div>

            {/* RECOVERY TYPE */}
            <div style={styles.group}>
                <label>Recovery Type</label>
                <select
                    value={recoveryType}
                    onChange={e => setRecoveryType(e.target.value)}
                >
                    <option value="under">Under</option>
                    <option value="over">Over</option>
                </select>
            </div>

            {/* RECOVERY BARRIER */}
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
        padding: "20px",
        maxWidth: "500px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column" as const,
        gap: "15px",
        background: "#111",
        color: "#fff",
        borderRadius: "10px"
    },
    group: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "5px"
    },
    buttons: {
        display: "flex",
        gap: "10px"
    }
};