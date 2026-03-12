"use client"
import React from 'react'
import { PlusIcon, PanelLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DASHBOARDS } from '@/lib/dashboards'

function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <div className='w-70 border-r flex flex-col px-2 py-1.5 gap-1.5'>
            <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Dashboards</span>
                <div className='flex gap-1 items-center'>
                    <button className='p-1 text-muted-foreground hover:text-primary hover:cursor-pointer'>
                        <PlusIcon size={15} />
                    </button>
                    <button className='p-1 text-muted-foreground hover:text-primary hover:cursor-pointer'>
                        <PanelLeftIcon size={15} />
                    </button>
                </div>
            </div>
            <div className='flex items-center px-2.5 py-1.5 text-sm flex rounded-xs bg-accent text-muted-foreground/50'>
                Search
            </div>
            <div className='flex justify-between items-center pt-1.5'>
                <span className='text-sm text-muted-foreground'>Active</span>
            </div>
            {/* Dashboard list */}
            {DASHBOARDS.map((dashboard) => {
                const isActive = pathname === `/dashboard/${dashboard.id}`;
                return (
                    <Link
                        key={dashboard.id}
                        href={`/dashboard/${dashboard.id}`}
                        className={`flex items-center px-2.5 py-1.5 text-sm rounded-xs transition-colors ${isActive
                            ? 'bg-accent text-primary/90'
                            : 'text-primary/90 hover:bg-accent/50'
                            }`}
                    >
                        {dashboard.title}
                    </Link>
                );
            })}
        </div>
    )
}

export default DashboardSidebar