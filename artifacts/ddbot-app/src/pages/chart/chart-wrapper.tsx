import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/hooks/useStore';
import Chart from './chart';
import './chart.scss';

interface ChartWrapperProps {
    prefix?: string;
    show_digits_stats: boolean;
}

const ChartWrapper = observer(
    ({ prefix = 'chart', show_digits_stats }: ChartWrapperProps) => {
        const { client, chart_store } = useStore();
        const [uuid] = useState(() => uuidv4());

        const uniqueKey = client?.loginid
            ? `${prefix}-${client.loginid}`
            : `${prefix}-${uuid}`;

        // ✅ Safe access to candles
        const candles = chart_store?.candles ?? [];

        // ✅ Extract last digit safely
        const digits = useMemo(() => {
            return candles.map(c => {
                const close = c?.close ?? 0;
                return Number(String(close).slice(-1));
            });
        }, [candles]);

        return (
            <Chart
                key={uniqueKey}
                show_digits_stats={show_digits_stats}
                candles={candles}
                digits={digits}
            />
        );
    }
);

export default ChartWrapper;