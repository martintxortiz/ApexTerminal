"use client";

/* ──────────────────────────────────────────────────────────────
   DashboardGrid — react-grid-layout orchestrator
   Renders a responsive grid of dashboard widgets.
   ────────────────────────────────────────────────────────────── */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Responsive, useContainerWidth } from "react-grid-layout";
import { getDashboardById } from "@/lib/config/dashboards";
import {
    NumberWidget,
    StatusWidget,
    GaugeWidget,
    CameraWidget,
} from "@/components/widgets";
import dynamic from "next/dynamic";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./DashboardGrid.css";
import type { DashboardItem } from "@/lib/types";

const GraphWidget = dynamic(
    () => import("@/components/widgets/GraphWidget").then((mod) => mod.GraphWidget),
    { ssr: false },
);

// ── Widget dispatcher ──────────────────────────────────────────

const WidgetCell = React.memo(({ item }: { item: DashboardItem }) => {
    switch (item.type) {
        case "graph": return <GraphWidget item={item} />;
        case "status": return <StatusWidget item={item} />;
        case "gauge": return <GaugeWidget item={item} />;
        case "camera": return <CameraWidget item={item} />;
        default: return <NumberWidget item={item} />;
    }
});
WidgetCell.displayName = "WidgetCell";

// ── Grid layout constants ──────────────────────────────────────

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 } as const;
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } as const;
const ROW_HEIGHT = 95;

// ── Component ──────────────────────────────────────────────────

const DashboardGrid = ({ dashboardId }: { dashboardId: string }) => {
    const { width, containerRef, mounted } = useContainerWidth();
    const dashboard = getDashboardById(dashboardId);
    const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");

    const [layouts, setLayouts] = useState<any>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(`dashboard_layouts_${dashboardId}`);
            if (saved) {
                try { return JSON.parse(saved); } catch { /* fall through */ }
            }
        }
        return dashboard?.layouts ?? { lg: [] };
    });

    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            !localStorage.getItem(`dashboard_layouts_${dashboardId}`) &&
            dashboard
        ) {
            setLayouts(dashboard.layouts);
        }
    }, [dashboardId, dashboard]);

    const handleLayoutSettle = useCallback(
        (layout: any) => {
            setLayouts((prev: any) => {
                const updated = { ...prev, [currentBreakpoint]: layout };
                localStorage.setItem(
                    `dashboard_layouts_${dashboardId}`,
                    JSON.stringify(updated),
                );
                return updated;
            });
        },
        [currentBreakpoint, dashboardId],
    );

    const handleBreakpointChange = useCallback(
        (bp: string) => setCurrentBreakpoint(bp),
        [],
    );

    const itemsById = useMemo(() => {
        if (!dashboard) return new Map<string, DashboardItem>();
        return new Map(dashboard.items.map((item) => [item.id, item]));
    }, [dashboard]);

    if (!dashboard) return null;

    return (
        <div ref={containerRef} style={{ width: "100%" }}>
            {mounted && (
                <Responsive
                    className="layout"
                    width={width}
                    layouts={layouts}
                    breakpoints={BREAKPOINTS}
                    cols={COLS}
                    rowHeight={ROW_HEIGHT}
                    // @ts-expect-error draggableHandle is valid but missing from types
                    draggableHandle=".drag-handle"
                    resizeHandles={["se", "sw"]}
                    measureBeforeMount={false}
                    onBreakpointChange={handleBreakpointChange}
                    onDragStop={handleLayoutSettle}
                    onResizeStop={handleLayoutSettle}
                >
                    {dashboard.items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-accent rounded-xs shadow-sm flex flex-col overflow-hidden group p-0.5"
                        >
                            <WidgetCell item={itemsById.get(item.id) ?? item} />
                        </div>
                    ))}
                </Responsive>
            )}
        </div>
    );
};

export default DashboardGrid;
