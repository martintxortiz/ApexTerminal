"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Responsive, useContainerWidth } from "react-grid-layout";
import { getDashboardById, DashboardItem } from "@/lib/dashboards";
import { NumberWidget } from "@/components/dash/NumberWidget";
import { StatusWidget } from "@/components/dash/StatusWidget";
import { GaugeWidget } from "@/components/dash/GaugeWidget";
import { CameraWidget } from "@/components/dash/CameraWidget";
import dynamic from "next/dynamic";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./DashboardGrid.css";

const GraphWidget = dynamic(
    () => import("@/components/dash/GraphWidget").then((mod) => mod.GraphWidget),
    { ssr: false }
);

/* ── Memoized cell — each widget owns its own handle now ─────── */
const WidgetCell = React.memo(({ item }: { item: DashboardItem }) => {
    switch (item.type) {
        case "graph":
            return <GraphWidget item={item} />;
        case "status":
            return <StatusWidget item={item} />;
        case "gauge":
            return <GaugeWidget item={item} />;
        case "camera":
            return <CameraWidget item={item} />;
        default:
            return <NumberWidget item={item} />;
    }
});
WidgetCell.displayName = "WidgetCell";

/* ── Grid ────────────────────────────────────────────────────── */
const DashboardGrid = ({ dashboardId }: { dashboardId: string }) => {
    const { width, containerRef, mounted } = useContainerWidth();
    const dashboard = getDashboardById(dashboardId);
    const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");

    const [layouts, setLayouts] = useState<any>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(`dashboard_layouts_${dashboardId}`);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    // fall through to default
                }
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
                    JSON.stringify(updated)
                );
                return updated;
            });
        },
        [currentBreakpoint, dashboardId]
    );

    const handleBreakpointChange = useCallback((bp: string) => setCurrentBreakpoint(bp), []);

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
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={95}
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
