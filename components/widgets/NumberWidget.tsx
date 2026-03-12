"use client";

import React, { useCallback, useRef, useState } from "react";
import { useTelemetrySubscription } from "@/components/providers";
import { formatValue } from "@/lib/format";
import { WidgetShell } from "./WidgetShell";
import type { DashboardItem } from "@/lib/types";

interface NumberWidgetProps {
    item: DashboardItem;
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
            [item.id, item.multiplier, item.precision],
        ),
    );

    return (
        <WidgetShell title={item.title}>
            <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center pb-1 h-full">
                <div className="text-4xl font-mono tracking-tighter text-foreground tabular-nums">
                    {display}
                </div>
            </div>
        </WidgetShell>
    );
});

NumberWidget.displayName = "NumberWidget";
