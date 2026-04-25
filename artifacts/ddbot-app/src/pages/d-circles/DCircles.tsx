import React, { useEffect, useMemo, useRef, useState } from 'react';
import './dcircles.scss';
import { SYMBOLS } from './symbols';
import { analyzeSignals } from './signalEngine';


const WS_URL = 'wss://ws.binaryws.com/websockets/v3?app_id=1089';
const TICK_LIMIT = 1200;

const DCircles = () => {
    const [symbol, setSymbol] = useState('R_75');

    // 🔥 STORE ALL SYMBOL DATA
    const [digitsMap, setDigitsMap] = useState<Record<string, number[]>>(() => {
    const saved = localStorage.getItem('digitsMap');
    return saved ? JSON.parse(saved) : {};
});

    const wsRef = useRef<WebSocket | null>(null);

    // 🚀 SINGLE WS FOR ALL MARKETS
    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            // subscribe to ALL symbols
            SYMBOLS.forEach(s => {
                ws.send(JSON.stringify({
                    ticks: s.value,
                    subscribe: 1
                }));
            });
        };

        ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);

            if (!data.tick) return;

            const sym = data.tick.symbol;
            const digit = Number(
    data.tick.quote
        .toFixed(2)      // ensure consistent decimals
        .slice(-1)
);

            setDigitsMap(prev => {
                const prevDigits = prev[sym] || [];

                const updated =
                    prevDigits.length >= TICK_LIMIT
                        ? [...prevDigits.slice(1), digit]
                        : [...prevDigits, digit];

                return {
                    ...prev,
                    [sym]: updated
                };
            });
        };

        return () => ws.close();
    }, []);

    useEffect(() => {
    localStorage.setItem('digitsMap', JSON.stringify(digitsMap));
}, [digitsMap]);

    // 🎯 CURRENT SYMBOL DATA
    const digits = digitsMap[symbol] || [];
    const latestDigit = digits.length ? digits[digits.length - 1] : null; // ❌ outside component

    // 📊 Frequency
    const freq = useMemo(() => {
        const map: Record<number, number> = {};
        for (let i = 0; i < 10; i++) map[i] = 0;

        digits.forEach(d => map[d]++);

        return map;
    }, [digits]);

    // 🏆 Ranking
    const ranked = useMemo(() => {
        return Object.entries(freq)
            .map(([digit, count]) => ({ digit: Number(digit), count }))
            .sort((a, b) => b.count - a.count);
    }, [freq]);

    const most = ranked[0]?.digit;
    const secondMost = ranked[1]?.digit;
    const secondLeast = ranked[8]?.digit;
    const least = ranked[9]?.digit;

    const color = (d: number) => {
        if (d === most) return '#00ff66';
        if (d === secondMost) return '#3399ff';
        if (d === secondLeast) return '#ff9900';
        if (d === least) return '#ff3333';
        return '#555';
    };

    const total = digits.length || 1;

    // 🚨 SIGNALS
    const signals = useMemo(() => {
        return analyzeSignals(freq, total);
    }, [freq, total]);

    // 📊 Over/Under
    const over = digits.filter(d => d >= 5).length;
    const under = digits.filter(d => d < 5).length;

    const overPct = ((over / total) * 100).toFixed(1);
    const underPct = ((under / total) * 100).toFixed(1);
    const evenCount = digits.filter(d => d % 2 === 0).length;
const oddCount = digits.filter(d => d % 2 !== 0).length;

const evenPct = ((evenCount / total) * 100).toFixed(1);
const oddPct = ((oddCount / total) * 100).toFixed(1);

    return (
        <div className="dcircles-container">

            <h3>DCircles (Live Multi-Market)</h3>

            {/* 🔽 SYMBOL SELECTOR */}
            <select
                className="symbol-select"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
            >
                {SYMBOLS.map(s => (
                    <option key={s.value} value={s.value}>
                        {s.label}
                    </option>
                ))}
            </select>

            {/* 🔵 CIRCLES */}
         <div className="circles">
    {Object.keys(freq).map(d => {
        const digit = Number(d);
        const percent = (freq[digit] / total) * 100;

        const isActive = digit === latestDigit;

        return (
            <div key={digit} className="circle-wrapper">
                <div
                    className={`circle ${isActive ? 'active' : ''}`}
                    style={{
                        borderColor: color(digit),
                        boxShadow:
                            percent > 12
                                ? `0 0 10px ${color(digit)}`
                                : 'none'
                    }}
                >
                    <span>{digit}</span>
                </div>
                <small>{percent.toFixed(1)}%</small>
            </div>
        );
    })}
</div>
 {/* 📊 EVEN / ODD*/}
<div className="even-odd">
    <div className="even" style={{ width: `${evenPct}%` }}>
        Even {evenPct}%
    </div>
    <div className="odd" style={{ width: `${oddPct}%` }}>
        Odd {oddPct}%
    </div>
</div>

            {/* 📊 OVER / UNDER */}
            <div className="bar">
                <div className="over" style={{ width: `${overPct}%` }}>
                    Over {overPct}%
                </div>
                <div className="under" style={{ width: `${underPct}%` }}>
                    Under {underPct}%
                </div>
            </div>

            {/* 🚨 SIGNALS */}
            <div className="signals">
                {signals.length === 0 && <p>No strong signal</p>}
                {signals.map((s, i) => (
                    <div key={i} className={`signal ${s.type?.toLowerCase()}`}>
                        {s.message}
                    </div>
                ))}
            </div>

            {/* 🔢 STREAM */}
          <div className="stream">
    {digits.slice(-60).map((d, i, arr) => {
        const isActive = i === arr.length - 1; // last digit = cursor

        return (
            <span
                key={i}
                className={`tick ${isActive ? 'active' : ''}`}
            >
                {d}
            </span>
        );
    })}
</div>
 {/* 🔢 TICKER CONTAINER FOR EVEN/ODD*/}
<div className="ticker-container">
    <div className="ticker-track">
      {digits.slice(-40).map((d, i, arr) => {
    const isEven = d % 2 === 0;

    return (
        <div
            key={i}
            className={`tick-box ${isEven ? 'even' : 'odd'} ${i === arr.length - 1 ? 'latest' : ''}`}
        >
            {isEven ? 'E' : 'O'}
        </div>
    );
})}
    </div>
</div>
        </div>
    );
};

export default DCircles;