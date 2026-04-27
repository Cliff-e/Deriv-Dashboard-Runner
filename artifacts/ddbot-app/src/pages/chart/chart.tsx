import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import chart_api from '@/external/bot-skeleton/services/api/chart-api';
import { useStore } from '@/hooks/useStore';
import {
    TicksHistoryResponse,
    TicksStreamRequest,
} from '@deriv/api-types';
import { ChartTitle, SmartChart } from '@deriv/deriv-charts';
import { useDevice } from '@deriv-com/ui';
import ToolbarWidgets from './toolbar-widgets';
import '@deriv/deriv-charts/dist/smartcharts.css';
import DigitCircles from '../d-circles/DigitCircles';
import { useDigits } from '@/hooks/useDigits';

type TSubscription = {
    [key: string]: null | {
        unsubscribe?: () => void;
    };
};

type TError = null | {
    error?: {
        code?: string;
        message?: string;
    };
};

const subscriptions: TSubscription = {};

const Chart = observer(({ show_digits_stats }: { show_digits_stats: boolean }) => {
    const { common, ui, chart_store, run_panel, dashboard } = useStore();

    const {
        chart_type,
        getMarketsOrder,
        granularity,
        onSymbolChange,
        setChartStatus,
        symbol,
        updateChartType,
        updateGranularity,
        updateSymbol,
        setChartSubscriptionId,
        chart_subscription_id,
    } = chart_store;

    const digits = useDigits(symbol);

    const chartSubscriptionIdRef = useRef(chart_subscription_id);

    const { isDesktop, isMobile } = useDevice();
    const { is_drawer_open } = run_panel;
    const { is_chart_modal_visible } = dashboard;

    const [isSafari, setIsSafari] = useState(false);

    // ✅ Stable barriers (FIXED)
    const barriers = useMemo(() => [], []);

    // ✅ Safari detection once
    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        setIsSafari(
            ua.includes('safari') &&
            !ua.includes('chrome') &&
            !ua.includes('android')
        );

        return () => {
            chart_api.api.forgetAll('ticks');
        };
    }, []);

    useEffect(() => {
        chartSubscriptionIdRef.current = chart_subscription_id;
    }, [chart_subscription_id]);

    useEffect(() => {
        if (!symbol) updateSymbol();
    }, [symbol, updateSymbol]);

    // ✅ Stable API request
    const requestAPI = useCallback((req) => {
        if (!chart_api?.api) return Promise.reject('API not ready');
        return chart_api.api.send(req);
    }, []);

    const requestForgetStream = useCallback((subscription_id: string) => {
        if (subscription_id) chart_api.api.forget(subscription_id);
    }, []);

    // ✅ Stable subscribe function (IMPORTANT FIX)
    const requestSubscribe = useCallback(async (req: TicksStreamRequest, callback: (data: any) => void) => {
        try {
            requestForgetStream(chartSubscriptionIdRef.current);

            const history = await chart_api.api.send(req);
            setChartSubscriptionId(history?.subscription.id);

            if (history) callback(history);

            if (req.subscribe === 1) {
                subscriptions[history?.subscription.id] =
                    chart_api.api.onMessage()?.subscribe(({ data }: { data: TicksHistoryResponse }) => {
                        callback(data);
                    });
            }
        } catch (e) {
            (e as TError)?.error?.code === 'MarketIsClosed' && callback([]);
            console.log((e as TError)?.error?.message);
        }
    }, [requestForgetStream, setChartSubscriptionId]);

    // ✅ Stable widgets (IMPORTANT FIX)
    const toolbarWidget = useCallback(() => (
        <ToolbarWidgets
            updateChartType={updateChartType}
            updateGranularity={updateGranularity}
            position={!isDesktop ? 'bottom' : 'top'}
            isDesktop={isDesktop}
        />
    ), [isDesktop, updateChartType, updateGranularity]);

    const topWidgets = useCallback(() => (
        <ChartTitle onChange={onSymbolChange} />
    ), [onSymbolChange]);

    const settings = useMemo(() => ({
        assetInformation: false,
        countdown: true,
        isHighestLowestMarkerEnabled: false,
        language: common.current_language.toLowerCase(),
        position: ui.is_chart_layout_default ? 'bottom' : 'left',
        theme: ui.is_dark_mode_on ? 'dark' : 'light',
    }), [common.current_language, ui.is_chart_layout_default, ui.is_dark_mode_on]);

    // ✅ Cleanup subscriptions (IMPORTANT FIX)
    useEffect(() => {
        return () => {
            Object.values(subscriptions).forEach(sub => sub?.unsubscribe?.());
        };
    }, []);

    if (!symbol) return null;

    const is_connection_opened = !!chart_api?.api;

    return (
        <div
            className={classNames('dashboard__chart-wrapper', {
                'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
                'dashboard__chart-wrapper--safari': isSafari,
            })}
            style={{ position: 'relative', minHeight: '700px' }}
            dir="ltr"
        >
            <SmartChart
                id="dbot"
                barriers={barriers}
                showLastDigitStats={show_digits_stats}
                chartControlsWidgets={null}
                enabledChartFooter={false}
                chartStatusListener={(v: boolean) => setChartStatus(!v)}
                toolbarWidget={toolbarWidget}
                chartType={chart_type}
                isMobile={isMobile}
                enabledNavigationWidget={isDesktop}
                granularity={granularity}
                requestAPI={requestAPI}
                requestForget={() => {}}
                requestForgetStream={() => {}}
                requestSubscribe={requestSubscribe}
                settings={settings}
                symbol={symbol}
                topWidgets={topWidgets}
                isConnectionOpened={is_connection_opened}
                getMarketsOrder={getMarketsOrder}
                isLive
                leftMargin={80}
            />

            {/* Overlay */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    pointerEvents: 'none',
                }}
            >
                <div
                    style={{
                        pointerEvents: 'auto',
                        background: 'rgba(0,0,0,0.5)',
                        padding: '6px 10px',
                        borderRadius: '10px',
                    }}
                >
                    <DigitCircles digits={digits} />
                </div>
            </div>
        </div>
    );
});

export default Chart;