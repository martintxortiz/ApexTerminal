"use client"

import React, { useState, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Edit2Icon, SaveIcon } from 'lucide-react'

// Assuming Button relies on basic UI - if the actual Button file has issues, this still works with standard HTML buttons as a fallback, but we'll try to use the imported variant
import { Button } from '../ui/button'

const ResponsiveGridLayout = WidthProvider(Responsive);

const Widget = ({ title, children }: { title: string, children: React.ReactNode }) => {
    return (
        <div className="flex flex-col h-full w-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-sm group">
            <div className="border-b border-zinc-800 px-3 py-2 bg-zinc-900/50 flex justify-between items-center cursor-move handle">
                <span className="text-sm font-medium text-zinc-300">{title}</span>
            </div>
            <div className="flex-1 p-4 overflow-auto">
                {children}
            </div>
        </div>
    )
}

const initialLayout = [
    { i: 'widget-1', x: 0, y: 0, w: 6, h: 3 },
    { i: 'widget-2', x: 6, y: 0, w: 6, h: 3 },
    { i: 'widget-3', x: 0, y: 3, w: 4, h: 3 },
    { i: 'widget-4', x: 4, y: 3, w: 4, h: 3 },
    { i: 'widget-5', x: 8, y: 3, w: 4, h: 3 },
]

export default function DashboardGrid() {
    const [layout, setLayout] = useState<any[]>(initialLayout)
    const [editMode, setEditMode] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem('dashboardLayout')
        if (saved) {
            setLayout(JSON.parse(saved))
        }
    }, [])

    const onLayoutChange = (newLayout: any) => {
        if (editMode) {
            setLayout(newLayout)
            localStorage.setItem('dashboardLayout', JSON.stringify(newLayout))
        }
    }

    if (!mounted) return null

    return (
        <div className="flex flex-col h-full p-6 w-full min-h-screen">
            <div className="flex justify-between items-center mb-6 px-4">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight">Main Dashboard</h1>
                    <p className="text-sm text-muted-foreground">System telemetry and overview metrics</p>
                </div>
                <Button
                    variant={editMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    className="flex gap-2"
                >
                    {editMode ? <SaveIcon size={16} /> : <Edit2Icon size={16} />}
                    {editMode ? "Done Editing" : "Edit Layout"}
                </Button>
            </div>

            <div className="flex-1">
                <ResponsiveGridLayout
                    className="layout"
                    layouts={{ lg: layout }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={60}
                    onLayoutChange={onLayoutChange}
                    isDraggable={editMode}
                    isResizable={editMode}
                    draggableHandle=".handle"
                    margin={[16, 16]}
                >
                    <div key="widget-1">
                        <Widget title="Revenue Overview">
                            <div className="flex items-center justify-center h-full text-zinc-400 font-mono text-3xl">
                                $124,592.00
                            </div>
                        </Widget>
                    </div>
                    <div key="widget-2">
                        <Widget title="Active Users">
                            <div className="flex items-center justify-center h-full text-zinc-400 font-mono text-3xl">
                                8,942
                            </div>
                        </Widget>
                    </div>
                    <div key="widget-3">
                        <Widget title="CPU Usage">
                            <div className="flex items-center justify-center h-full text-terminal-orange font-mono text-2xl">
                                78.2%
                            </div>
                        </Widget>
                    </div>
                    <div key="widget-4">
                        <Widget title="Memory Load">
                            <div className="flex items-center justify-center h-full text-zinc-400 font-mono text-2xl">
                                42.8%
                            </div>
                        </Widget>
                    </div>
                    <div key="widget-5">
                        <Widget title="System Status">
                            <div className="flex items-center justify-center h-full text-terminal-green font-mono text-2xl">
                                ONLINE
                            </div>
                        </Widget>
                    </div>
                </ResponsiveGridLayout>
            </div>
        </div>
    )
}
