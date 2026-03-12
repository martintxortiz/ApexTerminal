"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";
import { useTelemetrySubscription } from "./TelemetryContext";
import { DashboardItem } from "@/lib/dashboards";

interface GraphWidgetProps {
    item: DashboardItem;
}

const DEFAULT_COLORS = ["#00FF00", "#FF0000", "#3b82f6", "#f59e0b", "#8b5cf6"];

const TIME_WINDOWS = {
    "30s": 30_000,
    "1m": 60_000,
    "10m": 10 * 60_000,
    "1h": 60 * 60_000,
} as const;

type TimeScale = keyof typeof TIME_WINDOWS;
type Point = [number, number];

const TIME_SCALES = Object.keys(TIME_WINDOWS) as TimeScale[];

/* ── helpers ─────────────────────────────────────────────────── */

function normalizeTimestamp(value: unknown): number | null {
    if (typeof value !== "number" || !Number.isFinite(value) || value === 0) return null;
    return value < 10_000_000_000 ? value * 1000 : value;
}

function getPacketTimestamp(packet: any): number | null {
    return normalizeTimestamp(packet?.ts ?? packet?.timestamp ?? packet?.payload?.timestamp);
}

function getPacketValue(packet: any, key: string, multiplier?: number): number | null {
    const raw = packet?.payload?.[key] ?? packet?.[key];
    if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
    return multiplier !== undefined ? raw * multiplier : raw;
}

function getHistoryLimit(windowMs: number): number {
    return Math.min(Math.ceil(windowMs / 100), 10_000);
}

/* ── static chart option (set once on init) ──────────────────── */

function buildBaseOption(keys: string[], colors: string[], yPrecision: number, tooltipPrecision: number) {
    return {
        backgroundColor: "transparent",
        color: colors,
        animation: false,
        tooltip: {
            trigger: "axis" as const,
            confine: true,
            transitionDuration: 0,
            axisPointer: {
                type: "cross" as const,
                animation: false,
                snap: false,
                label: { backgroundColor: "#18181b", color: "#e4e4e7", fontSize: 11 },
            },
            backgroundColor: "rgba(24, 24, 27, 0.85)",
            borderColor: "transparent",
            borderWidth: 0,
            textStyle: { color: "#e4e4e7", fontSize: 11 },
            padding: [6, 8],
            extraCssText: "border-radius:2px; box-shadow:0 4px 12px rgba(0,0,0,0.3); border:none;",
            valueFormatter: (value: number | string) => {
                if (typeof value === "number") return value.toFixed(tooltipPrecision);
                return value;
            },
        },
        legend: { show: false },
        grid: { left: 12, right: 62, top: 10, bottom: 26, containLabel: false, borderWidth: 0 },
        xAxis: {
            type: "time" as const,
            boundaryGap: false,
            axisLine: { show: false },
            axisTick: { show: false },
            splitNumber: 3,
            axisLabel: {
                color: "#e4e4e7",
                fontSize: 12,
                fontFamily: "monospace",
                margin: 10,
                hideOverlap: true,
                formatter: "{HH}:{mm}:{ss}",
            },
            splitLine: {
                show: true,
                lineStyle: { color: "rgba(255,255,255,0.025)", type: "solid" as const },
            },
        },
        yAxis: {
            type: "value" as const,
            position: "right" as const,
            splitNumber: 2,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: "#e4e4e7",
                fontSize: 12,
                fontFamily: "monospace",
                margin: 10,
                formatter: (value: number) => value.toFixed(yPrecision),
            },
            splitLine: {
                lineStyle: { color: "rgba(255,255,255,0.025)", type: "solid" as const },
            },
        },
        series: keys.map((key, i) => ({
            name: key,
            type: "line" as const,
            data: [] as Point[],
            showSymbol: false,
            symbol: "none",
            smooth: false,
            animation: false,
            connectNulls: false,
            lineStyle: { width: 1, color: colors[i % colors.length] },
            emphasis: { focus: "series" as const },
        })),
    };
}

/* ── component ───────────────────────────────────────────────── */

export const GraphWidget: React.FC<GraphWidgetProps> = React.memo(({ item }) => {
    const chartElRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<echarts.ECharts | null>(null);
    const rafRef = useRef<number | null>(null);
    const dataRef = useRef<Record<string, Point[]>>({});
    const yRangeRef = useRef<{ min: number; max: number } | null>(null);

    const [timeScale, setTimeScale] = useState<TimeScale>("1m");
    const [streaming, setStreaming] = useState(true);
    const [loading, setLoading] = useState(true);
    const streamingRef = useRef(streaming);
    streamingRef.current = streaming;

    const timeScaleRef = useRef(timeScale);
    timeScaleRef.current = timeScale;

    const keys = useMemo(() => item.keys ?? [], [item.keys]);
    const colors = useMemo(() => item.colors ?? DEFAULT_COLORS, [item.colors]);

    /* ── schedule a render on the next animation frame ────── */
    const scheduleRender = useCallback(() => {
        if (rafRef.current != null) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            const chart = chartRef.current;
            if (!chart || chart.isDisposed()) return;

            const windowMs = TIME_WINDOWS[timeScaleRef.current];

            let latest = 0;
            for (const key of keys) {
                const arr = dataRef.current[key];
                if (arr?.length) latest = Math.max(latest, arr[arr.length - 1][0]);
            }
            if (!latest) latest = Date.now();

            const minTs = latest - windowMs;

            // Trim old points
            for (const key of keys) {
                const arr = dataRef.current[key];
                if (!arr?.length) continue;
                let cutIdx = 0;
                while (cutIdx < arr.length && arr[cutIdx][0] < minTs) cutIdx++;
                if (cutIdx > 0) dataRef.current[key] = arr.slice(cutIdx);
            }

            // Stable Y-range: expand instantly, shrink slowly (5% per frame)
            let dataMin = Infinity;
            let dataMax = -Infinity;
            for (const key of keys) {
                const arr = dataRef.current[key] ?? [];
                for (let i = 0; i < arr.length; i++) {
                    const v = arr[i][1];
                    if (v < dataMin) dataMin = v;
                    if (v > dataMax) dataMax = v;
                }
            }
            if (!Number.isFinite(dataMin)) { dataMin = 0; dataMax = 1; }
            if (dataMin === dataMax) { dataMin -= 0.5; dataMax += 0.5; }
            const pad = (dataMax - dataMin) * 0.1;
            const targetMin = dataMin - pad;
            const targetMax = dataMax + pad;

            const prev = yRangeRef.current;
            let yMin: number, yMax: number;
            if (!prev) {
                yMin = targetMin;
                yMax = targetMax;
            } else {
                yMin = targetMin < prev.min ? targetMin : prev.min + (targetMin - prev.min) * 0.05;
                yMax = targetMax > prev.max ? targetMax : prev.max + (targetMax - prev.max) * 0.05;
            }
            yRangeRef.current = { min: yMin, max: yMax };

            chart.setOption(
                {
                    xAxis: { min: minTs, max: latest },
                    yAxis: { min: yMin, max: yMax },
                    series: keys.map((key) => ({
                        data: dataRef.current[key] ?? [],
                    })),
                },
                { lazyUpdate: false, silent: true }
            );
        });
    }, [keys]);

    /* ── chart lifecycle ─────────────────────────────────── */
    useEffect(() => {
        const el = chartElRef.current;
        if (!el) return;

        const chart = echarts.init(el, "dark", { renderer: "canvas" });
        chartRef.current = chart;
        chart.setOption(buildBaseOption(
            keys,
            colors,
            item.precision ?? 2,
            item.tooltipPrecision ?? 2
        ));

        let resizeTimer: ReturnType<typeof setTimeout> | null = null;
        const ro = new ResizeObserver(() => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resizeTimer = null;
                if (!chartRef.current || chartRef.current.isDisposed()) return;
                const w = el.clientWidth;
                const h = el.clientHeight;
                if (w > 0 && h > 0) chartRef.current.resize();
            }, 100);
        });
        ro.observe(el);

        scheduleRender();

        return () => {
            if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            if (resizeTimer) clearTimeout(resizeTimer);
            ro.disconnect();
            chart.dispose();
            chartRef.current = null;
        };
    }, [keys, colors, scheduleRender]);

    /* ── reset data when item or keys change ─────────────── */
    useEffect(() => {
        const next: Record<string, Point[]> = {};
        for (const key of keys) next[key] = [];
        dataRef.current = next;
        yRangeRef.current = null;
        scheduleRender();
    }, [item.id, keys, scheduleRender]);

    /* ── load history from REST API ──────────────────────── */
    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const windowMs = TIME_WINDOWS[timeScale];
                const host = window.location.hostname;
                const limit = getHistoryLimit(windowMs);
                const res = await fetch(
                    `http://${host}:8000/telemetry/history?limit=${limit}`
                );
                if (!res.ok || cancelled) return;

                const history: any[] = await res.json();
                if (cancelled) return;

                history.reverse();

                const next: Record<string, Point[]> = {};
                for (const key of keys) next[key] = [];

                for (const packet of history) {
                    const ts = getPacketTimestamp(packet);
                    if (ts == null) continue;
                    for (const key of keys) {
                        const value = getPacketValue(packet, key, item.multiplier);
                        if (value == null) continue;
                        next[key].push([ts, value]);
                    }
                }

                // Trim to window
                let latest = 0;
                for (const key of keys) {
                    const arr = next[key];
                    if (arr.length) latest = Math.max(latest, arr[arr.length - 1][0]);
                }
                const minTs = (latest || Date.now()) - windowMs;
                for (const key of keys) {
                    let cutIdx = 0;
                    const arr = next[key];
                    while (cutIdx < arr.length && arr[cutIdx][0] < minTs) cutIdx++;
                    if (cutIdx > 0) next[key] = arr.slice(cutIdx);
                }

                dataRef.current = next;
                yRangeRef.current = null;
                scheduleRender();
            } catch (err) {
                console.error("[GraphWidget] Failed to load history:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [item.id, item.multiplier, keys, timeScale, scheduleRender]);

    /* ── live telemetry via subscriber (no re-renders) ───── */
    useTelemetrySubscription(
        useCallback(
            (packet) => {
                if (!streamingRef.current) return;

                const ts = getPacketTimestamp(packet);
                if (ts == null) return;

                let changed = false;
                for (const key of keys) {
                    const value = getPacketValue(packet, key, item.multiplier);
                    if (value == null) continue;

                    const arr = (dataRef.current[key] ??= []);
                    const last = arr.length ? arr[arr.length - 1] : null;

                    if (!last || ts > last[0]) {
                        arr.push([ts, value]);
                        changed = true;
                    } else if (ts === last[0] && last[1] !== value) {
                        arr[arr.length - 1] = [ts, value];
                        changed = true;
                    }
                }

                if (changed) scheduleRender();
            },
            [keys, item.multiplier, scheduleRender]
        )
    );

    /* ── re-render when time scale changes ───────────────── */
    useEffect(() => {
        scheduleRender();
    }, [timeScale, scheduleRender]);

    /* ── JSX — the widget owns its own drag handle ───────── */
    return (
        <div className="flex flex-col w-full h-full">
            {/* Handle bar: controls left, title right */}
            <div className="drag-handle flex items-center justify-between px-1.5 py-1 cursor-grab active:cursor-grabbing flex-shrink-0">
                <span className="text-muted-foreground/80 text-sm truncate ml-2">
                    {item.title}
                </span>
                <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
                    {/* Time scale selector */}
                    {TIME_SCALES.map((scale) => (
                        <button
                            key={scale}
                            type="button"
                            onClick={() => setTimeScale(scale)}
                            className={`rounded-sm px-1.5 py-0 text-[9px] font-medium transition-colors ${timeScale === scale
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            {scale}
                        </button>
                    ))}

                    {/* Divider */}
                    <div className="w-px h-3 bg-border/50 mx-0.5" />

                    {/* Play / Pause */}
                    <button
                        type="button"
                        onClick={() => setStreaming((s) => !s)}
                        className={`rounded-sm px-1 py-0 text-[9px] font-medium transition-colors ${streaming
                            ? "text-emerald-400 hover:bg-muted"
                            : "text-amber-400 hover:bg-muted"
                            }`}
                        title={streaming ? "Pause live stream" : "Resume live stream"}
                    >
                        {streaming ? "▶ LIVE" : "⏸ PAUSED"}
                    </button>
                </div>
            </div>

            {/* Chart area */}
            <div className="flex-1 min-h-0 min-w-0 overflow-hidden relative">
                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <div className="text-[10px] text-muted-foreground/60 animate-pulse">Loading…</div>
                    </div>
                )}

                {/* Custom legend — aligned with graph grid */}
                <div
                    className="absolute z-10 flex flex-col gap-0.5 pointer-events-none px-1.5 py-1"
                    style={{ top: 10, left: 12, backgroundColor: "rgba(24, 24, 27, 0.85)", borderRadius: 2 }}
                >
                    {keys.map((key, i) => (
                        <div key={key} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                            <span className="truncate">{key}</span>
                            <span
                                className="inline-block w-2.5 h-2.5 rounded-[2px] flex-shrink-0"
                                style={{ backgroundColor: colors[i % colors.length], opacity: 0.35 }}
                            />
                        </div>
                    ))}
                </div>

                <div
                    ref={chartElRef}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                />
            </div>
        </div>
    );
});

GraphWidget.displayName = "GraphWidget";
