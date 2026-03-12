"use client"

import React, { useState, useEffect } from 'react'
import { ResponsiveGridLayout, useContainerWidth, Layout, ResponsiveLayouts } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'


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

const initialLayout: Layout = [
    { i: 'altitude', x: 0, y: 0, w: 6, h: 3 },
    { i: 'velocity', x: 6, y: 0, w: 6, h: 3 },
    { i: 'fuel', x: 0, y: 3, w: 4, h: 3 },
    { i: 'orbit', x: 4, y: 3, w: 4, h: 3 },
    { i: 'telemetry', x: 8, y: 3, w: 4, h: 3 },
]

export default function DashboardGrid() {
    const { width, containerRef, mounted: widthMounted } = useContainerWidth()

    if (!widthMounted) return null

    return (
        <div className="flex flex-col h-full p-6 w-full min-h-screen">
            <div className="flex justify-between items-center mb-6 px-4">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight">Mission Control</h1>
                    <p className="text-sm text-muted-foreground">Orbital vehicle telemetry and systems overview</p>
                </div>
            </div>

            <div className="flex-1" ref={containerRef}>
                {widthMounted && (
                    <ResponsiveGridLayout
                        className="layout"
                        width={width}
                        layouts={{ lg: initialLayout }}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={60}
                        dragConfig={{ enabled: false }}
                        resizeConfig={{ enabled: false }}
                        margin={[16, 16]}
                    >
                        <div key="altitude">
                            <Widget title="Altitude (ASL)">
                                <div className="flex items-center justify-center h-full text-zinc-400 font-mono text-3xl">
                                    408.5 km
                                </div>
                            </Widget>
                        </div>
                        <div key="velocity">
                            <Widget title="Orbital Velocity">
                                <div className="flex items-center justify-center h-full text-zinc-400 font-mono text-3xl">
                                    7.66 km/s
                                </div>
                            </Widget>
                        </div>
                        <div key="fuel">
                            <Widget title="Propellant">
                                <div className="flex items-center justify-center h-full text-terminal-orange font-mono text-2xl">
                                    42.8%
                                </div>
                            </Widget>
                        </div>
                        <div key="orbit">
                            <Widget title="Inclination">
                                <div className="flex items-center justify-center h-full text-zinc-400 font-mono text-2xl">
                                    51.64°
                                </div>
                            </Widget>
                        </div>
                        <div key="telemetry">
                            <Widget title="Telemetry Link">
                                <div className="flex items-center justify-center h-full text-terminal-green font-mono text-2xl">
                                    NOMINAL
                                </div>
                            </Widget>
                        </div>
                    </ResponsiveGridLayout>
                )}
            </div>
        </div>
    )
}
