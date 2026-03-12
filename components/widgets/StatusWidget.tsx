"use client";

import React, { useCallback, useRef, useState } from "react";
import { useTelemetrySubscription } from "@/components/providers";
import { toDisplay, resolveStatusColor } from "@/lib/format";
import { WidgetShell } from "./WidgetShell";
import type { DashboardItem } from "@/lib/types";

interface StatusWidgetProps {
    item: DashboardItem;
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
                setBgColor(resolveStatusColor(raw, item.statusColors));
            },
            [item.id, item.statusColors],
        ),
    );

    return (
        <WidgetShell title={item.title} style={{ backgroundColor: bgColor }}>
            <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center pb-2 h-full">
                <div className="text-4xl tracking-tight text-foreground uppercase">
                    {display}
                </div>
            </div>
        </WidgetShell>
    );
});

StatusWidget.displayName = "StatusWidget";
