import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import './dcircles.scss';




const DCircles = observer(() => {
    const { chart_store } = useStore();

    const [digits, setDigits] = useState<number[]>([]);

    // ✅ THIS MUST ALREADY BE USED BY YOUR WORKING CHART
    const tick = chart_store?.last_tick;

    useEffect(() => {
        if (!tick?.quote) return;

        const digit = Number(String(tick.quote).slice(-1));

        setDigits(prev => {
            const updated = [...prev, digit];
            if (updated.length > 1200) updated.shift();
            return updated;
        });
    }, [tick]);

    const freq = useMemo(() => {
        const map: Record<number, number> = {};
        for (let i = 0; i < 10; i++) map[i] = 0;

        digits.forEach(d => {
            map[d] = (map[d] || 0) + 1;
        });

        return map;
    }, [digits]);

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
        return '#444';
    };

    return (
        <div className="dcircles-container">

            <h3>Live Deriv Digit Circles</h3>

            <div className="circles">
                {Object.keys(freq).map(d => {
                    const digit = Number(d);

                    return (
                        <div
                            key={digit}
                            className="circle"
                            style={{ border: `3px solid ${color(digit)}` }}
                        >
                            <span>{digit}</span>
                            <small>{freq[digit]}</small>
                        </div>
                    );
                })}
            </div>

            <div className="stream">
                {digits.slice(-60).map((d, i) => (
                    <span key={i}>{d}</span>
                ))}
            </div>

        </div>
    );
});

export default DCircles;