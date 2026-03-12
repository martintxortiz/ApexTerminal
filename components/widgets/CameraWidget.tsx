"use client";

import React, { useCallback, useMemo, useState } from "react";
import { WidgetShell } from "./WidgetShell";
import type { DashboardItem } from "@/lib/types";

interface CameraWidgetProps {
    item: DashboardItem;
}

type VideoState = "loading" | "ready" | "error";

const VIDEO_STATUS_INDICATOR: Record<VideoState, { className: string; label: string }> = {
    ready: { className: "text-terminal-green", label: "●" },
    error: { className: "text-terminal-red", label: "✕" },
    loading: { className: "text-muted-foreground", label: "○" },
};

export const CameraWidget: React.FC<CameraWidgetProps> = React.memo(({ item }) => {
    const [videoState, setVideoState] = useState<VideoState>("loading");
    const [aspectRatio, setAspectRatio] = useState(item.aspectRatio || "16 / 9");

    const videoUrl = useMemo(() => item.videoUrl?.trim() || "", [item.videoUrl]);

    const handleLoadedMetadata = useCallback(
        (event: React.SyntheticEvent<HTMLVideoElement>) => {
            const video = event.currentTarget;
            if (video.videoWidth > 0 && video.videoHeight > 0) {
                setAspectRatio(`${video.videoWidth} / ${video.videoHeight}`);
            }
            setVideoState("ready");
        },
        [],
    );

    const indicator = VIDEO_STATUS_INDICATOR[videoState];

    const statusNode = (
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${indicator.className}`}>
            {indicator.label}
        </span>
    );

    return (
        <WidgetShell title={item.title} status={statusNode}>
            <div
                className="relative w-full h-full bg-muted overflow-hidden"
                style={{ aspectRatio }}
            >
                {videoUrl ? (
                    <video
                        src={videoUrl}
                        poster={item.posterUrl}
                        autoPlay={item.autoPlay ?? true}
                        muted={item.muted ?? true}
                        playsInline
                        controls={item.controls ?? false}
                        loop={item.loop ?? true}
                        preload="metadata"
                        onLoadedMetadata={handleLoadedMetadata}
                        onCanPlay={() => setVideoState("ready")}
                        onError={() => setVideoState("error")}
                        className="absolute inset-0 w-full h-full object-contain bg-accent"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                        No videoUrl configured
                    </div>
                )}

                {videoUrl && videoState !== "ready" && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground bg-black/70 pointer-events-none">
                        {videoState === "error" ? "Video feed unavailable" : "Loading..."}
                    </div>
                )}
            </div>
        </WidgetShell>
    );
});

CameraWidget.displayName = "CameraWidget";
