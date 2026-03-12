"use client";

import React, { useCallback, useRef, useState } from "react";
import { useTelemetrySubscription } from "./TelemetryContext";
import { DashboardItem } from "@/lib/dashboards";

interface NumberWidgetProps {
    item: DashboardItem;
}

function formatValue(raw: unknown, multiplier?: number, precision?: number): string {
    if (raw === undefined || raw === null) return "--";

    if (typeof raw === "number") {
        const value = multiplier !== undefined ? raw * multiplier : raw;
        const p = precision !== undefined ? precision : value % 1 === 0 ? 0 : 2;
        return p === 0 ? String(Math.round(value)) : value.toFixed(p);
    }

    if (typeof raw === "boolean") return raw ? "True" : "False";

    return String(raw);
}

export const NumberWidget: React.FC<NumberWidgetProps> = React.memo(({ item }) => {
    const [display, setDisplay] = useState("--");
    const lastValueRef = useRef<unknown>(undefined);

    useTelemetrySubscription(
        useCallback(
            (packet) => {
                const raw = packet?.payload?.[item.id] ?? (packet as any)?.[item.id];
                if (raw === undefined) return;

                if (raw === lastValueRef.current) return;
                lastValueRef.current = raw;

                setDisplay(formatValue(raw, item.multiplier, item.precision));
            },
            [item.id, item.multiplier, item.precision]
        )
    );

    return (
        <div className="flex flex-col w-full h-full">
            {/* Handle bar: title only */}
            <div className="drag-handle flex items-center px-1.5 py-1 cursor-grab active:cursor-grabbing flex-shrink-0">
                <span className="text-muted-foreground/80 text-sm truncate">
                    {item.title}
                </span>
            </div>

            {/* Value area */}
            <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center pb-1">
                <div className="text-4xl font-mono tracking-tighter text-foreground tabular-nums">
                    {display}
                </div>
            </div>
        </div>
    );
});

NumberWidget.displayName = "NumberWidget";
