/* ──────────────────────────────────────────────────────────────
   ApexTerminal — Shared Formatting Utilities
   Reusable value formatting and color resolution helpers.
   ────────────────────────────────────────────────────────────── */

/**
 * Format a raw telemetry value for numeric display.
 * Applies an optional multiplier and controls decimal precision.
 */
export function formatValue(
    raw: unknown,
    multiplier?: number,
    precision?: number,
): string {
    if (raw === undefined || raw === null) return "--";

    if (typeof raw === "number") {
        const value = multiplier !== undefined ? raw * multiplier : raw;
        const p = precision !== undefined ? precision : value % 1 === 0 ? 0 : 2;
        return p === 0 ? String(Math.round(value)) : value.toFixed(p);
    }

    if (typeof raw === "boolean") return raw ? "True" : "False";

    return String(raw);
}

/**
 * Convert any raw telemetry value to a display string.
 */
export function toDisplay(raw: unknown): string {
    if (raw === undefined || raw === null) return "--";
    if (typeof raw === "boolean") return raw ? "True" : "False";
    if (typeof raw === "number") return String(raw);
    return String(raw);
}

/**
 * Resolve a status indicator background color.
 *
 * Priority:
 *   1. `statusColors` map — exact string match (case-insensitive)
 *   2. Built-in defaults: booleans / "true"/"false" → green/red
 *   3. No match → transparent
 */
export function resolveStatusColor(
    raw: unknown,
    statusColors?: Record<string, string>,
): string {
    const key = toDisplay(raw).toLowerCase();

    if (statusColors) {
        for (const [k, v] of Object.entries(statusColors)) {
            if (k.toLowerCase() === key) return v;
        }
    }

    if (raw === true || key === "true" || key === "ok" || key === "1")
        return "rgba(22,163,74,0.35)";
    if (raw === false || key === "false" || key === "err" || key === "0")
        return "rgba(220,38,38,0.35)";

    return "transparent";
}
