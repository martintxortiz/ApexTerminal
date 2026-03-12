"use client";

import React, { useCallback, useRef, useState } from "react";
import { useTelemetrySubscription } from "./TelemetryContext";
import { DashboardItem } from "@/lib/dashboards";

interface StatusWidgetProps {
    item: DashboardItem;
}

/** Resolve a raw value to a display string */
function toDisplay(raw: unknown): string {
    if (raw === undefined || raw === null) return "--";
    if (typeof raw === "boolean") return raw ? "True" : "False";
    if (typeof raw === "number") return String(raw);
    return String(raw);
}

/**
 * Determine background color.
 * Priority:
 *   1. `item.statusColors` map — exact string match (case-insensitive), e.g. { "true": "#16a34a", "false": "#dc2626" }
 *   2. Built-in defaults: booleans / "true"/"false" strings → green/red
 *   3. No match → transparent (neutral)
 */
function resolveColor(raw: unknown, statusColors?: Record<string, string>): string {
    const key = toDisplay(raw).toLowerCase();

    if (statusColors) {
        for (const [k, v] of Object.entries(statusColors)) {
            if (k.toLowerCase() === key) return v;
        }
    }

    // Defaults
    if (raw === true || key === "true" || key === "ok" || key === "1") return "rgba(22,163,74,0.35)";
    if (raw === false || key === "false" || key === "err" || key === "0") return "rgba(220,38,38,0.35)";

    return "transparent";
}

export const StatusWidget: React.FC<StatusWidgetProps> = React.memo(({ item }) => {
    const [display, setDisplay] = useState("--");
    const [bgColor, setBgColor] = useState("transparent");
    const lastRawRef = useRef<unknown>(undefined);

    useTelemetrySubscription(
        useCallback(
            (packet) => {
                const raw = packet?.payload?.[item.id] ?? (packet as any)?.[item.id];
                if (raw === undefined) return;
                if (raw === lastRawRef.current) return;
                lastRawRef.current = raw;

                setDisplay(toDisplay(raw));
                setBgColor(resolveColor(raw, item.statusColors));
            },
            [item.id, item.statusColors]
        )
    );

    return (
        <div
            className="flex flex-col w-full h-full"
            style={{ backgroundColor: bgColor }}
        >
            {/* Handle bar */}
            <div className="drag-handle flex items-center px-1.5 py-1 cursor-grab active:cursor-grabbing flex-shrink-0">
                <span className="text-muted-foreground/80 text-sm truncate">
                    {item.title}
                </span>
            </div>

            {/* Value */}
            <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center pb-2">
                <div className="text-4xl tracking-tight text-foreground uppercase ">
                    {display}
                </div>
            </div>
        </div>
    );
});

StatusWidget.displayName = "StatusWidget";
