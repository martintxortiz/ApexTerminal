"use client";

import { BoltIcon, PencilIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDashboardById } from "@/lib/dashboards";
import { useParams } from "next/navigation";

const DashboardGrid = dynamic(
    () => import("@/components/dash/DashboardGrid"),
    {
        ssr: false,
        loading: () => <div className="h-full w-full bg-background" />,
    }
);

export default function DashboardPage() {
    const params = useParams();
    const dashboardId = typeof params.id === "string" ? params.id : "";
    const dashboard = getDashboardById(dashboardId);

    if (!dashboard) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                Dashboard not found.
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">

            <div className="border-b items-center px-2 py-1.5 flex justify-between sticky top-0 z-10 bg-background shrink-0">
                <h1 className="text-sm text-muted-foreground">{dashboard.title}</h1>
                <div className="flex gap-3 items-center">
                    <Link href="" className="hover:text-primary text-muted-foreground">
                        <PencilIcon size={14} />
                    </Link>
                    <Link href="" className="hover:text-primary text-muted-foreground">
                        <BoltIcon size={14} />
                    </Link>
                </div>
            </div>

            <ScrollArea className="flex-1 h-0">
                <DashboardGrid dashboardId={dashboard.id} />
            </ScrollArea>

        </div>
    );
}
