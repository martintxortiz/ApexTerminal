"use client";

import React, { useCallback, useMemo, useState } from "react";
import { DashboardItem } from "@/lib/dashboards";

interface CameraWidgetProps {
    item: DashboardItem & {
        videoUrl?: string;
        posterUrl?: string;
        aspectRatio?: string;
        autoPlay?: boolean;
        muted?: boolean;
        controls?: boolean;
        loop?: boolean;
    };
}

type VideoState = "loading" | "ready" | "error";

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
        []
    );

    const handleError = useCallback(() => {
        setVideoState("error");
    }, []);

    return (
        <div className="flex flex-col w-full h-full">
            <div className="drag-handle flex items-center px-1.5 py-1 cursor-grab active:cursor-grabbing flex-shrink-0">
                <span className="text-muted-foreground/80 text-sm truncate">
                    {item.title}
                </span>

                <span
                    className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${videoState === "ready"
                        ? "text-terminal-green"
                        : videoState === "error"
                            ? "text-terminal-red"
                            : "text-muted-foreground"
                        }`}
                >
                    {videoState === "ready"
                        ? "●"
                        : videoState === "error"
                            ? "✕"
                            : "○"}
                </span>
            </div>

            <div className="flex-1 min-h-0 min-w-0">
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
                            onError={handleError}
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
            </div>
        </div>
    );
});

CameraWidget.displayName = "CameraWidget";
