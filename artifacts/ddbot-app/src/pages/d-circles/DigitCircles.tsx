import React, { useMemo } from 'react';

const DigitCircles = ({ digits }: { digits: number[] }) => {
    const total = digits.length || 1;

    // 🔢 frequency
    const freq = useMemo(() => {
        const map: Record<number, number> = {};
        for (let i = 0; i < 10; i++) map[i] = 0;

        digits.forEach(d => map[d]++);

        return map;
    }, [digits]);

    // 🏆 ranking
    const ranked = useMemo(() => {
        return Object.entries(freq)
            .map(([digit, count]) => ({
                digit: Number(digit),
                count
            }))
            .sort((a, b) => b.count - a.count);
    }, [freq]);

    const most = ranked[0]?.digit;
    const least = ranked[9]?.digit;

    // 🎯 ACTIVE (latest digit)
    const activeDigit = digits[digits.length - 1];

    const getColor = (d: number) => {
        if (d === most) return '#00ff66';   // 🟢 most
        if (d === least) return '#ff3333';  // 🔴 least
        return '#888';
    };

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px'
            }}
        >
            {Object.keys(freq).map(d => {
                const digit = Number(d);
                const percent = (freq[digit] / total) * 100;
                const isActive = digit === activeDigit;

                return (
                    <div key={digit} style={{ textAlign: 'center' }}>
                        
                        {/* 🔵 CIRCLE */}
                        <div
                            style={{
                                position: 'relative', // 🔥 required for cursor
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

                            {/* 🔺 RED TRIANGLE CURSOR */}
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

                        {/* 📊 % */}
                        <div style={{ fontSize: 10, color: '#aaa' }}>
                            {percent.toFixed(0)}%
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DigitCircles;