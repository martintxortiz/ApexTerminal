export type Layouts = { [P: string]: any[] };

export interface DashboardItem {
    id: string;
    type?: "number" | "graph" | "status" | "gauge" | "camera";
    keys?: string[]; // Used for graphs to specify which telemetry keys to plot
    colors?: string[]; // Custom line colors per key (defaults to built-in palette)
    title: string;
    description?: string;
    multiplier?: number;
    precision?: number; // Y-axis tick decimal places (default 2)
    tooltipPrecision?: number; // Tooltip value decimal places (default 2)
    statusColors?: Record<string, string>; // e.g. { "true": "#16a34a", "false": "#dc2626" }
    gaugeMin?: number;          // Min value for gauge fill (default 0)
    gaugeMax?: number;          // Max value for gauge fill (default 100)
    gaugeColor?: string;        // Fill color (default #3b82f6)
    gaugeOrientation?: "vertical" | "horizontal"; // default vertical
    gaugeKey?: string;          // Telemetry key to read (defaults to item.id)
    historyMinutes?: number;
    // Camera widget properties
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

export const DASHBOARDS: DashboardData[] = [
    {
        id: "resources",
        title: "Resources",
        layouts: {
            lg: [
                // Top row: Numbers
                { i: "alt_agl_m", x: 0, y: 0, w: 2, h: 1 },
                { i: "alt_msl_m", x: 2, y: 0, w: 2, h: 1 },
                { i: "mono_amount", x: 4, y: 0, w: 2, h: 1 },
                { i: "oxidizer_amount", x: 6, y: 0, w: 2, h: 1 },
                { i: "lf_amount", x: 8, y: 0, w: 2, h: 1 },
                { i: "ec_amount", x: 10, y: 0, w: 2, h: 1 },

                // Second row: Communications
                { i: "signal_strength", x: 0, y: 1, w: 2, h: 1 },
                { i: "signal_delay_s", x: 2, y: 1, w: 2, h: 1 },
                { i: "can_communicate", x: 4, y: 1, w: 2, h: 1 },

                // Gauges
                { i: "lf_gauge", x: 6, y: 1, w: 2, h: 2 },
                { i: "ox_gauge", x: 8, y: 1, w: 2, h: 2 },

                // Third row: Graphs
                { i: "alt_graph", x: 0, y: 2, w: 6, h: 3 },
                { i: "prop_graph", x: 6, y: 3, w: 6, h: 3 },
                { i: "mono_graph", x: 0, y: 5, w: 6, h: 3 },
                { i: "ec_graph", x: 6, y: 5, w: 6, h: 3 },
            ]
        },
        items: [
            { id: "alt_agl_m", type: "number", title: "Alt AGL (km)", multiplier: 0.001, precision: 2 },
            { id: "alt_msl_m", type: "number", title: "Alt MSL (km)", multiplier: 0.001, precision: 2 },
            { id: "mono_amount", type: "number", title: "Mono Amount" },
            { id: "oxidizer_amount", type: "number", title: "LOX" },
            { id: "lf_amount", type: "number", title: "FUEL" },
            { id: "ec_amount", type: "number", title: "EC Amount" },
            { id: "signal_strength", type: "number", title: "Signal Strength", precision: 2 },
            { id: "signal_delay_s", type: "number", title: "Signal Delay (s)", precision: 3 },
            { id: "can_communicate", type: "status", title: "Comms" },
            { id: "lf_gauge", type: "gauge", title: "FUEL", gaugeKey: "lf_amount", gaugeMin: 0, gaugeMax: 58.67, gaugeColor: "#FF990077" },
            { id: "ox_gauge", type: "gauge", title: "LOX", gaugeKey: "oxidizer_amount", gaugeMin: 0, gaugeMax: 71.71, gaugeColor: "#3b82f677" },
            { id: "ec_gauge", type: "gauge", title: "EC", gaugeKey: "ec_amount", gaugeMin: 0, gaugeMax: 100, gaugeColor: "rgba(22,163,74,0.35)" },
            { id: "mono_gauge", type: "gauge", title: "Mono", gaugeKey: "mono_amount", gaugeMin: 0, gaugeMax: 4, gaugeColor: "#d95b7277" },
            { id: "alt_graph", type: "graph", title: "Altitude History", keys: ["alt_agl_m", "alt_msl_m"], historyMinutes: 5 },
            { id: "prop_graph", type: "graph", title: "Propellant Levels", keys: ["oxidizer_amount", "lf_amount"], historyMinutes: 5 },
            { id: "mono_graph", type: "graph", title: "Monopropellant Level", keys: ["mono_amount"], historyMinutes: 5 },
            { id: "ec_graph", type: "graph", title: "EC Level", keys: ["ec_amount"], historyMinutes: 5 },
        ]
    },
    {
        id: "gnc-fsw",
        title: "GNC-FSW",
        layouts: {
            lg: [
                { i: "pad-a-engines", x: 0, y: 0, w: 5, h: 3 },
                { i: "pad-a-general", x: 5, y: 0, w: 5, h: 3 },
            ],
        },
        items: [
            {
                id: "pad-a-engines",
                title: "PAD A - ENGINES",
                type: "camera",
                videoUrl: "https://videos.pexels.com/video-files/854259/854259-hd_1280_720_48fps.mp4",
                aspectRatio: "16 / 9",
                autoPlay: true,
                muted: true,
                controls: false,
                loop: true,
            },
            {
                id: "pad-a-general",
                title: "PAD A - GENERAL",
                type: "camera",
                videoUrl: "https://videos.pexels.com/video-files/854252/854252-hd_1920_1080_24fps.mp4",
                aspectRatio: "16 / 9",
                autoPlay: true,
                muted: true,
                controls: false,
                loop: true,
            },
        ]
    },
    {
        id: "flight-dynamics",
        title: "Flight Dynamics",
        layouts: {
            lg: [
                { i: "traj", x: 0, y: 0, w: 6, h: 3 },
                { i: "orb", x: 6, y: 0, w: 3, h: 3 },
                { i: "prop", x: 0, y: 3, w: 4, h: 2 },
            ],
        },
        items: [
            { id: "traj", title: "Trajectory Map" },
            { id: "orb", title: "Orbit Analysis" },
            { id: "prop", title: "Propulsion Control" },
        ]
    }
];

export function getDashboardById(id: string): DashboardData | undefined {
    return DASHBOARDS.find(d => d.id === id);
}
