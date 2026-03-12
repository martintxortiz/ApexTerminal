"use client";

import { ActivityIcon, BoltIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    { label: "Dashboards", href: "/dashboard" },
    { label: "Packets", href: "/packets" },
    { label: "Commands", href: "/commands" },
    { label: "Config", href: "/config" },
] as const;

const ACTIONS = [
    { icon: ActivityIcon, href: "", label: "Activity" },
    { icon: UserIcon, href: "", label: "User" },
    { icon: BoltIcon, href: "", label: "Settings" },
] as const;

export default function Topbar() {
    const pathname = usePathname();

    return (
        <div className="border-b flex p-2 items-center justify-between text-sm">
            <nav className="flex items-center gap-4">
                {NAV_ITEMS.map(({ label, href }) => (
                    <Link
                        key={label}
                        href={href === "/dashboard" ? "/dashboard/resources" : href}
                        className={`hover:text-primary ${pathname.startsWith(href)
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                    >
                        {label}
                    </Link>
                ))}
            </nav>
            <div className="flex items-center gap-2">
                {ACTIONS.map(({ icon: Icon, href, label }) => (
                    <Link
                        key={label}
                        href={href}
                        className="hover:text-primary text-muted-foreground"
                        aria-label={label}
                    >
                        <Icon size={14} />
                    </Link>
                ))}
            </div>
        </div>
    );
}
