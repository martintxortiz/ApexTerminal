/* ──────────────────────────────────────────────────────────────
   WidgetShell — Shared widget chrome
   Provides the drag-handle title bar and content container
   used by every dashboard widget.
   ────────────────────────────────────────────────────────────── */

import React from "react";

interface WidgetShellProps {
    /** Widget title shown in the drag-handle bar */
    title: string;
    /** Optional controls rendered at the right of the title bar */
    controls?: React.ReactNode;
    /** Optional status indicator rendered after the title */
    status?: React.ReactNode;
    /** Widget content */
    children: React.ReactNode;
    /** Extra className applied to the outer container */
    className?: string;
    /** Inline style applied to the outer container (e.g. for status bg) */
    style?: React.CSSProperties;
}

export const WidgetShell: React.FC<WidgetShellProps> = ({
    title,
    controls,
    status,
    children,
    className = "",
    style,
}) => (
    <div className={`flex flex-col w-full h-full ${className}`} style={style}>
        {/* Drag handle — title bar */}
        <div className="drag-handle flex items-center justify-between px-1.5 py-1 cursor-grab active:cursor-grabbing flex-shrink-0">
            <span className="text-muted-foreground/80 text-sm truncate">
                {title}
            </span>
            <div className="flex items-center gap-1">
                {status}
                {controls && (
                    <div onMouseDown={(e) => e.stopPropagation()}>
                        {controls}
                    </div>
                )}
            </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
            {children}
        </div>
    </div>
);

WidgetShell.displayName = "WidgetShell";
