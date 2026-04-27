import React, { useMemo, useEffect, useState } from 'react';

// 🔥 TRUE LAST DIGIT (NO ROUNDING, NO FIXED PRECISION)
const getLastDigit = (price: number) => {
    const str = price.toLocaleString('en-US', {
        useGrouping: false,
        maximumFractionDigits: 20,
    });

    const parts = str.split('.');

    // No decimals → use integer last digit
    if (parts.length < 2) {
        return Number(str.slice(-1));
    }

    // Return last decimal digit
    return Number(parts[1].slice(-1));
};

const DigitCircles = ({ quote }: { quote: number | null }) => {

    // =========================
    // INTERNAL DIGIT BUFFER
    // =========================
    const [digits, setDigits] = useState<number[]>(() => {
        const saved = localStorage.getItem('digits_buffer');
        return saved ? JSON.parse(saved) : [];
    });

    // =========================
    // SYNC WITH LIVE QUOTE
    // =========================
    useEffect(() => {
        if (quote === null || quote === undefined) return;

        const digit = getLastDigit(quote);

        setDigits(prev => {
            const updated =
                prev.length >= 1200
                    ? [...prev.slice(1), digit]
                    : [...prev, digit];

            localStorage.setItem('digits_buffer', JSON.stringify(updated));
            return updated;
        });
    }, [quote]);

    // =========================
    // SAFE DIGITS
    // =========================
    const safeDigits = useMemo(() => {
        if (!Array.isArray(digits)) return [];

        return digits
            .map(d => Number(d))
            .filter(d => !isNaN(d) && d >= 0 && d <= 9)
            .map(d => Math.floor(d));
    }, [digits]);

    const total = safeDigits.length;

    // =========================
    // FREQUENCY MAP
    // =========================
    const freq = useMemo(() => {
        const map: Record<number, number> = {};

        for (let i = 0; i < 10; i++) {
            map[i] = 0;
        }

        safeDigits.forEach(d => {
            map[d]++;
        });

        return map;
    }, [safeDigits]);

    // =========================
    // RANKING
    // =========================
    const ranked = useMemo(() => {
        return Object.entries(freq)
            .map(([digit, count]) => ({
                digit: Number(digit),
                count
            }))
            .sort((a, b) => b.count - a.count);
    }, [freq]);

    const most = ranked[0]?.digit;
    const least = ranked[ranked.length - 1]?.digit;
    const activeDigit = safeDigits[safeDigits.length - 1];

    // =========================
    // COLOR LOGIC
    // =========================
    const getColor = (d: number) => {
        if (d === most) return '#00ff66';
        if (d === least) return '#ff3333';
        return '#888';
    };

    // =========================
    // UI (UNCHANGED)
    // =========================
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, minmax(70px, 1fr))',
                gap: '8px',
                marginTop: '20px'
            }}
        >
            {Object.keys(freq).map(key => {
                const digit = Number(key);

                const percent = total > 0
                    ? (freq[digit] / total) * 100
                    : 0;

                const isActive = digit === activeDigit;

                return (
                    <div key={digit} style={{ textAlign: 'center' }}>
                        
                        {/* CIRCLE */}
                        <div
                            style={{
                                position: 'relative',
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                border: `2px solid ${getColor(digit)}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: getColor(digit),
                                fontSize: 14,
                                fontWeight: 600,
                                background: '#111'
                            }}
                        >
                            {digit}

                            {/* ACTIVE POINTER */}
                            {isActive && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: -10,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 0,
                                        height: 0,
                                        borderLeft: '8px solid transparent',
                                        borderRight: '8px solid transparent',
                                        borderBottom: '12px solid red',
                                        filter: 'drop-shadow(0 0 6px red)',
                                        animation: 'pulse 1s infinite'
                                    }}
                                />
                            )}
                        </div>

                        {/* PERCENT */}
                        <div
                            style={{
                                fontSize: 10,
                                color: '#fff',
                                background: '#000',
                                display: 'inline-block',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600
                            }}
                        >
                            {percent.toFixed(2)}%
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DigitCircles;