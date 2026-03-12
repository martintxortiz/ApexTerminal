/* ──────────────────────────────────────────────────────────────
   ApexTerminal — Domain Types
   Central type definitions used across the application.
   ────────────────────────────────────────────────────────────── */

// ── Telemetry ──────────────────────────────────────────────────

export interface TelemetryPayload {
    timestamp?: number;
    [key: string]: unknown;
}

export interface TelemetryPacket {
    ts: number;
    mid: number;
    payload: TelemetryPayload;
}

export type PacketListener = (packet: TelemetryPacket) => void;

export interface TelemetryContextType {
    /** Subscribe to raw packets. Returns an unsubscribe function. */
    subscribe: (listener: PacketListener) => () => void;
    /** Latest packet (ref-based, does NOT trigger re-renders). */
    getLatestPacket: () => TelemetryPacket | null;
    isConnected: boolean;
}

// ── Dashboard ──────────────────────────────────────────────────

export type WidgetType = "number" | "graph" | "status" | "gauge" | "camera";

export type Layouts = Record<string, any[]>;

export interface DashboardItem {
    id: string;
    type?: WidgetType;
    title: string;
    description?: string;

    // Number / Graph
    keys?: string[];
    colors?: string[];
    multiplier?: number;
    precision?: number;
    tooltipPrecision?: number;
    historyMinutes?: number;

    // Status
    statusColors?: Record<string, string>;

    // Gauge
    gaugeMin?: number;
    gaugeMax?: number;
    gaugeColor?: string;
    gaugeOrientation?: "vertical" | "horizontal";
    gaugeKey?: string;

    // Camera
    videoUrl?: string;
    posterUrl?: string;
    aspectRatio?: string;
    autoPlay?: boolean;
    muted?: boolean;
    controls?: boolean;
    loop?: boolean;
}

export interface DashboardData {
    id: string;
    title: string;
    layouts: Layouts;
    items: DashboardItem[];
}
