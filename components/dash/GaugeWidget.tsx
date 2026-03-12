"use client";

import React, { useCallback, useRef, useState } from "react";
import { useTelemetrySubscription } from "./TelemetryContext";
import { DashboardItem } from "@/lib/dashboards";

interface GaugeWidgetProps {
    item: DashboardItem;
}

export const GaugeWidget: React.FC<GaugeWidgetProps> = React.memo(({ item }) => {
    const [value, setValue] = useState<number | null>(null);
    const lastRawRef = useRef<unknown>(undefined);

    const min = item.gaugeMin ?? 0;
    const max = item.gaugeMax ?? 100;
    const color = item.gaugeColor ?? "#3b82f6";
    const horizontal = item.gaugeOrientation === "horizontal";

    const pct = value == null
        ? 0
        : Math.max(0, Math.min(1, (value - min) / (max - min)));

    const displayValue = value == null
        ? "--"
        : (item.precision != null ? value.toFixed(item.precision) : String(Math.round(value)));

    useTelemetrySubscription(
        useCallback(
            (packet) => {
                const key = item.gaugeKey ?? item.id;
                const raw = packet?.payload?.[key] ?? (packet as any)?.[key];
                if (raw === undefined || raw === lastRawRef.current) return;
                lastRawRef.current = raw;
                const num = typeof raw === "number" ? raw : parseFloat(String(raw));
                if (Number.isFinite(num)) setValue(num * (item.multiplier ?? 1));
            },
            [item.id, item.gaugeKey, item.multiplier]
        )
    );

    return (
        <div className="relative flex flex-col w-full h-full overflow-hidden">
            <div
                className="absolute inset-0 transition-all duration-300"
                style={
                    horizontal
                        ? {
                            right: `${(1 - pct) * 100}%`,
                            backgroundColor: color,
                            opacity: 1,
                        }
                        : {
                            top: `${(1 - pct) * 100}%`,
                            backgroundColor: color,
                            opacity: 1,
                        }
                }
            />

            {/* Handle bar on top */}
            <div className="drag-handle relative z-10 flex items-center px-1.5 py-1 cursor-grab active:cursor-grabbing justify-center flex-shrink-0">
                <span className="text-foreground text-sm truncate bg-white/20 p-1">{item.title}</span>
            </div>

            {/* Value centered in the remaining space */}
            <div className="relative z-10 flex-1 min-h-0 min-w-0 flex flex-col items-center justify-center pb-1 gap-0.5">
                {/* <span className="text-3xl font-mono tabular-nums text-foreground">
                    {displayValue}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/60">
                    {min} – {max}
                </span> */}
            </div>
        </div>
    );
});

GaugeWidget.displayName = "GaugeWidget";
