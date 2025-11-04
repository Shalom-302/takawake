"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/ui/code-block";
import {
    ActivityGauge,
    BarChart01,
    BarChart02,
    LineChart01,
    LineChart02,
    LineChart03,
    PieChart,
    RadarChart,
} from "@/components/ui/chart";

export default function ChartDocsPage() {
    return (
        <main className="min-h-screen">
            <div className="max-w-6xl mx-auto py-16 px-4 space-y-20">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                        ← Back to Design System
                    </Link>
                    <p className="text-tertiary text-lg max-w-2xl">
                        A reusable chart component built with <code>Recharts</code>, supporting
                        responsive layouts, custom tooltips, legends, and dynamic gradients.
                    </p>
                </div>

                <section className="space-y-6">
                    <h2 className="text-3xl font-bold mb-3 text-primary">Line chart 01</h2>

                    <div className="space-y-4">
                        <div className="px-8 py-16 border border-tertiary rounded-xl">
                            <LineChart01 />
                        </div>

                        <CodeBlock
                            className="h-96 overflow-auto"
                            code={`
import { ChartLegendContent, ChartTooltipContent } from "./base";
import { useBreakpoint } from "@/lib/hooks/use-breakpoint";
import { cn } from "@/lib/utils/cn";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Label,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
const lineData = [
    { date: new Date(2025, 0, 1), A: 600, B: 400, C: 100 },
    { date: new Date(2025, 1, 1), A: 620, B: 405, C: 160 },
    { date: new Date(2025, 2, 1), A: 630, B: 400, C: 170 },
    { date: new Date(2025, 3, 1), A: 650, B: 410, C: 190 },
    { date: new Date(2025, 4, 1), A: 600, B: 320, C: 200 },
    { date: new Date(2025, 5, 1), A: 650, B: 430, C: 230 },
    { date: new Date(2025, 6, 1), A: 620, B: 400, C: 200 },
    { date: new Date(2025, 7, 1), A: 750, B: 540, C: 300 },
    { date: new Date(2025, 8, 1), A: 780, B: 490, C: 390 },
    { date: new Date(2025, 9, 1), A: 750, B: 450, C: 300 },
    { date: new Date(2025, 10, 1), A: 780, B: 480, C: 340 },
    { date: new Date(2025, 11, 1), A: 820, B: 500, C: 450 },
];
export const LineChart01 = () => {
    const isDesktop = useBreakpoint("lg");
    const colors: Record<string, string> = {
        A: "text-utility-brand-600",
        B: "text-utility-brand-400",
        C: "text-utility-brand-700",
    };
    return (
        <div className="flex h-60 flex-col gap-2">
            
            <ResponsiveContainer className="h-full">
                
                <AreaChart
                    data={lineData}
                    className="text-tertiary [&_.recharts-text]:text-xs"
                    margin={{ top: isDesktop ? 12 : 6, bottom: isDesktop ? 16 : 0 }}
                >
                    
                    <defs>
                        
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            
                            <stop
                                offset="5%"
                                stopColor="currentColor"
                                className="text-utility-brand-700"
                                stopOpacity="0.7"
                            />
                            <stop
                                offset="95%"
                                stopColor="currentColor"
                                className="text-utility-brand-700"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        vertical={false}
                        stroke="currentColor"
                        className="text-utility-gray-100"
                    />
                    <Legend
                        align="right"
                        verticalAlign="top"
                        layout={isDesktop ? "vertical" : "horizontal"}
                        content={<ChartLegendContent className="-translate-y-2" />}
                    />
                    <XAxis
                        fill="currentColor"
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                        dataKey="date"
                        tickFormatter={value =>
                            value.toLocaleDateString(undefined, { month: "short" })
                        }
                        padding={{ left: 10, right: 10 }}
                    >
                        
                        {isDesktop && (
                            <Label
                                fill="currentColor"
                                className="!text-xs font-medium max-lg:hidden"
                                position="bottom"
                            >
                                
                                Month
                            </Label>
                        )}
                    </XAxis>
                    <YAxis
                        fill="currentColor"
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                        tickFormatter={value => Number(value).toLocaleString()}
                    >
                        
                        <Label
                            value="Active users"
                            fill="currentColor"
                            className="!text-xs font-medium"
                            style={{ textAnchor: "middle" }}
                            angle={-90}
                            position="insideLeft"
                        />
                    </YAxis>
                    <Tooltip
                        content={<ChartTooltipContent />}
                        formatter={value => Number(value).toLocaleString()}
                        labelFormatter={value =>
                            value.toLocaleDateString(undefined, { month: "short", year: "numeric" })
                        }
                        cursor={{ className: "stroke-utility-brand-600 stroke-2" }}
                    />
                    <Area
                        isAnimationActive={false}
                        className={cn(
                            colors["A"],
                            "[&_.recharts-area-area]:translate-y-1.5 [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                        )}
                        dataKey="A"
                        name="Series 1"
                        type="monotone"
                        stroke="currentColor"
                        strokeWidth={2}
                        fill="url(#gradient)"
                        fillOpacity={0.1}
                        activeDot={{
                            className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                        }}
                    />
                    <Area
                        isAnimationActive={false}
                        className={cn(
                            colors["B"],
                            "[&_.recharts-area-area]:translate-y-1.5 [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                        )}
                        dataKey="B"
                        name="Series 2"
                        type="monotone"
                        stroke="currentColor"
                        strokeWidth={2}
                        fill="none"
                        activeDot={{
                            className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                        }}
                    />
                    <Area
                        isAnimationActive={false}
                        className={cn(
                            colors["C"],
                            "[&_.recharts-area-area]:translate-y-1.5 [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                        )}
                        dataKey="C"
                        name="Series 3"
                        type="monotone"
                        stroke="currentColor"
                        strokeWidth={2}
                        fill="none"
                        activeDot={{
                            className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
                        `}
                        />
                    </div>
                </section>
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold mb-3 text-primary">Line chart 02</h2>
                    <div className="space-y-4">
                        <div className="px-8 py-16 border border-tertiary rounded-xl">
                            <LineChart02 />
                        </div>

                        <CodeBlock
                            className="h-96 overflow-auto"
                            code={`import { ChartLegendContent, ChartTooltipContent } from "./base";
import { useBreakpoint } from "@/lib/hooks/use-breakpoint";
import { cn } from "@/lib/utils/cn";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Label,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const lineData = [
    {
        date: new Date(2025, 0, 1),
        A: 600,
        B: 400,
        C: 100,
    },
    {
        date: new Date(2025, 1, 1),
        A: 620,
        B: 405,
        C: 160,
    },
    {
        date: new Date(2025, 2, 1),
        A: 630,
        B: 400,
        C: 170,
    },
    {
        date: new Date(2025, 3, 1),
        A: 650,
        B: 410,
        C: 190,
    },
    {
        date: new Date(2025, 4, 1),
        A: 600,
        B: 320,
        C: 200,
    },
    {
        date: new Date(2025, 5, 1),
        A: 650,
        B: 430,
        C: 230,
    },
    {
        date: new Date(2025, 6, 1),
        A: 620,
        B: 400,
        C: 200,
    },
    {
        date: new Date(2025, 7, 1),
        A: 750,
        B: 540,
        C: 300,
    },
    {
        date: new Date(2025, 8, 1),
        A: 780,
        B: 490,
        C: 390,
    },
    {
        date: new Date(2025, 9, 1),
        A: 750,
        B: 450,
        C: 300,
    },
    {
        date: new Date(2025, 10, 1),
        A: 780,
        B: 480,
        C: 340,
    },
    {
        date: new Date(2025, 11, 1),
        A: 820,
        B: 500,
        C: 450,
    },
];

export const LineChart02 = () => {
    const isDesktop = useBreakpoint("lg");

    const colors: Record<string, string> = {
        A: "text-utility-brand-600",
        B: "text-utility-brand-400",
        C: "text-utility-brand-700",
    };

    return (
        <div className="flex h-60 flex-col gap-2">
            <ResponsiveContainer className="h-full">
                <AreaChart
                    data={lineData}
                    className="text-tertiary [&_.recharts-text]:text-xs"
                    margin={{
                        left: 5,
                        right: 5,
                        top: isDesktop ? 12 : 6,
                        bottom: isDesktop ? 16 : 0,
                    }}
                >
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="currentColor"
                                className="text-utility-brand-700"
                                stopOpacity="0.7"
                            />
                            <stop
                                offset="95%"
                                stopColor="currentColor"
                                className="text-utility-brand-700"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        vertical={false}
                        stroke="currentColor"
                        className="text-utility-gray-100"
                    />

                    <Legend
                        verticalAlign="top"
                        align="right"
                        layout={isDesktop ? "vertical" : "horizontal"}
                        content={<ChartLegendContent className="-translate-y-2" />}
                    />

                    <XAxis
                        fill="currentColor"
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                        dataKey="date"
                        tickFormatter={value =>
                            value.toLocaleDateString(undefined, { month: "short" })
                        }
                        padding={{ left: 10, right: 10 }}
                    >
                        {isDesktop && (
                            <Label
                                fill="currentColor"
                                className="!text-xs font-medium max-lg:hidden"
                                position="bottom"
                            >
                                Month
                            </Label>
                        )}
                    </XAxis>

                    <YAxis
                        fill="currentColor"
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                        tickFormatter={value => Number(value).toLocaleString()}
                    >
                        <Label
                            value="Active users"
                            fill="currentColor"
                            className="!text-xs font-medium"
                            style={{ textAnchor: "middle" }}
                            angle={-90}
                            position="insideLeft"
                        />
                    </YAxis>

                    <Tooltip
                        content={<ChartTooltipContent />}
                        formatter={value => Number(value).toLocaleString()}
                        labelFormatter={value =>
                            value.toLocaleDateString(undefined, { month: "short", year: "numeric" })
                        }
                        cursor={{
                            className: "stroke-utility-brand-600 stroke-2",
                        }}
                    />

                    <Area
                        isAnimationActive={false}
                        className={cn(
                            colors["A"],
                            "[&_.recharts-area-area]:translate-y-1.5 [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                        )}
                        dataKey="A"
                        name="Series 1"
                        type="monotone"
                        stroke="currentColor"
                        strokeWidth={2}
                        fill="url(#gradient)"
                        fillOpacity={0.1}
                        activeDot={{
                            className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                        }}
                    />

                    <Area
                        isAnimationActive={false}
                        className={cn(
                            colors["B"],
                            "[&_.recharts-area-area]:translate-y-1.5 [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                        )}
                        dataKey="B"
                        name="Series 2"
                        type="monotone"
                        stroke="currentColor"
                        strokeWidth={2}
                        fill="none"
                        strokeDasharray="0.1 8"
                        strokeLinecap="round"
                        activeDot={{
                            className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                        }}
                    />

                    <Area
                        isAnimationActive={false}
                        className={cn(
                            colors["C"],
                            "[&_.recharts-area-area]:translate-y-1.5 [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                        )}
                        dataKey="C"
                        name="Series 3"
                        type="monotone"
                        stroke="currentColor"
                        strokeWidth={2}
                        fill="none"
                        strokeDasharray="0.1 8"
                        strokeLinecap="round"
                        activeDot={{
                            className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
                            `}
                        />
                    </div>
                </section>
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold mb-3 text-primary">Line chart 03</h2>
                    <div className="space-y-4">
                        <div className="px-8 py-16 border border-tertiary rounded-xl">
                            <LineChart03 />
                        </div>

                        <CodeBlock
                            className="h-96 overflow-auto"
                            code={`import { useBreakpoint } from "@/lib/hooks/use-breakpoint";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Label,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ChartLegendContent, ChartTooltipContent } from "./base";
import { cn } from "@/lib/utils/cn";

const lineData = [
    {
        date: new Date(2025, 0, 1),
        A: 600,
        B: 400,
        C: 100,
    },
    {
        date: new Date(2025, 1, 1),
        A: 620,
        B: 405,
        C: 160,
    },
    {
        date: new Date(2025, 2, 1),
        A: 630,
        B: 400,
        C: 170,
    },
    {
        date: new Date(2025, 3, 1),
        A: 650,
        B: 410,
        C: 190,
    },
    {
        date: new Date(2025, 4, 1),
        A: 600,
        B: 320,
        C: 200,
    },
    {
        date: new Date(2025, 5, 1),
        A: 650,
        B: 430,
        C: 230,
    },
    {
        date: new Date(2025, 6, 1),
        A: 620,
        B: 400,
        C: 200,
    },
    {
        date: new Date(2025, 7, 1),
        A: 750,
        B: 540,
        C: 300,
    },
    {
        date: new Date(2025, 8, 1),
        A: 780,
        B: 490,
        C: 390,
    },
    {
        date: new Date(2025, 9, 1),
        A: 750,
        B: 450,
        C: 300,
    },
    {
        date: new Date(2025, 10, 1),
        A: 780,
        B: 480,
        C: 340,
    },
    {
        date: new Date(2025, 11, 1),
        A: 820,
        B: 500,
        C: 450,
    },
];

export const LineChart03 = () => {
    const isDesktop = useBreakpoint("lg");

    const colors: Record<string, string> = {
        A: "text-utility-brand-600",
        B: "text-utility-brand-400",
        C: "text-utility-brand-700",
    };

    return (
        <div className="flex h-60 flex-col gap-2">
            <ResponsiveContainer className="h-full">
                <AreaChart
                    data={lineData}
                    className="text-tertiary [&_.recharts-text]:text-xs"
                    margin={{
                        left: 5,
                        right: 5,
                        top: isDesktop ? 12 : 6,
                        bottom: isDesktop ? 16 : 0,
                    }}
                >
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="0%"
                                stopColor="currentColor"
                                className="text-utility-gray-500"
                                stopOpacity="0.8"
                            />
                            <stop
                                offset="80%"
                                stopColor="currentColor"
                                className="text-utility-gray-500"
                                stopOpacity="0"
                            />
                        </linearGradient>

                        <pattern
                            id="verticalLines"
                            width="8"
                            height="100%"
                            fill="url(#gradient)"
                            patternUnits="userSpaceOnUse"
                        >
                            <line
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="100%"
                                stroke="currentColor"
                                className="text-utility-gray-200"
                                strokeWidth="1.5"
                            />
                            <rect
                                width="100%"
                                height="100%"
                                fill="url(#gradient)"
                                fillOpacity={0.15}
                            />
                        </pattern>
                    </defs>

                    <CartesianGrid
                        vertical={false}
                        stroke="currentColor"
                        className="text-utility-gray-100"
                    />

                    <Legend
                        verticalAlign="top"
                        align="right"
                        layout={isDesktop ? "vertical" : "horizontal"}
                        content={<ChartLegendContent className="-translate-y-2" />}
                    />

                    <XAxis
                        fill="currentColor"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={10}
                        interval="preserveStartEnd"
                        dataKey="date"
                        padding={{ left: 10, right: 10 }}
                        tickFormatter={value =>
                            value.toLocaleDateString(undefined, { month: "short" })
                        }
                    >
                        {isDesktop && (
                            <Label
                                fill="currentColor"
                                className="!text-xs font-medium max-lg:hidden"
                                position="bottom"
                            >
                                Month
                            </Label>
                        )}
                    </XAxis>

                    <YAxis
                        fill="currentColor"
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                        tickFormatter={value => Number(value).toLocaleString()}
                    >
                        <Label
                            value="Active users"
                            fill="currentColor"
                            className="!text-xs font-medium"
                            style={{ textAnchor: "middle" }}
                            angle={-90}
                            position="insideLeft"
                        />
                    </YAxis>

                    <Tooltip
                        content={<ChartTooltipContent />}
                        formatter={value => Number(value).toLocaleString()}
                        labelFormatter={value =>
                            value.toLocaleDateString(undefined, { month: "short", year: "numeric" })
                        }
                        cursor={{
                            className: "stroke-utility-brand-600 stroke-2",
                        }}
                    />

                    <Area
                        isAnimationActive={false}
                        className={cn(
                            colors["A"],
                            "[&_.recharts-area-area]:translate-y-1.5 [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                        )}
                        dataKey="A"
                        name="Series 1"
                        type="monotone"
                        stroke="currentColor"
                        strokeWidth={2}
                        fill="url(#verticalLines)"
                        fillOpacity={1}
                        activeDot={{
                            className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                        }}
                    />

                    <Area
                        isAnimationActive={false}
                        className={cn(
                            colors["B"],
                            "[&_.recharts-area-area]:translate-y-1.5 [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                        )}
                        dataKey="B"
                        name="Series 2"
                        type="monotone"
                        stroke="currentColor"
                        strokeWidth={2}
                        fill="none"
                        activeDot={{
                            className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                        }}
                    />

                    <Area
                        isAnimationActive={false}
                        className={cn(
                            colors["C"],
                            "[&_.recharts-area-area]:translate-y-1.5 [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                        )}
                        dataKey="C"
                        name="Series 3"
                        type="monotone"
                        stroke="currentColor"
                        strokeWidth={2}
                        fill="none"
                        activeDot={{
                            className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
                            
                            `}
                        />
                    </div>
                </section>
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold mb-3 text-primary">Bar chart 01</h2>
                    <div className="space-y-4">
                        <div className="px-8 py-16 border border-tertiary rounded-xl">
                            <BarChart01 />
                        </div>

                        <CodeBlock
                            className="h-96 overflow-auto"
                            code={`import { useBreakpoint } from "@/lib/hooks/use-breakpoint";
import {
    Bar,
    CartesianGrid,
    Label,
    Legend,
    BarChart as RechartsBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ChartLegendContent, ChartTooltipContent } from "./base";

const barData = [
    {
        month: new Date(2025, 0, 1),
        A: 300,
        B: 200,
        C: 350,
    },
    {
        month: new Date(2025, 1, 1),
        A: 320,
        B: 300,
        C: 300,
    },
    {
        month: new Date(2025, 2, 1),
        A: 300,
        B: 200,
        C: 240,
    },
    {
        month: new Date(2025, 3, 1),
        A: 240,
        B: 300,
        C: 280,
    },
    {
        month: new Date(2025, 4, 1),
        A: 320,
        B: 280,
        C: 100,
    },
    {
        month: new Date(2025, 5, 1),
        A: 330,
        B: 300,
        C: 130,
    },
    {
        month: new Date(2025, 6, 1),
        A: 300,
        B: 200,
        C: 100,
    },
    {
        month: new Date(2025, 7, 1),
        A: 350,
        B: 300,
        C: 200,
    },
    {
        month: new Date(2025, 8, 1),
        A: 300,
        B: 200,
        C: 100,
    },
    {
        month: new Date(2025, 9, 1),
        A: 200,
        B: 300,
        C: 280,
    },
    {
        month: new Date(2025, 10, 1),
        A: 240,
        B: 300,
        C: 300,
    },
    {
        month: new Date(2025, 11, 1),
        A: 200,
        B: 400,
        C: 350,
    },
];

export const BarChart = () => {
    const isDesktop = useBreakpoint("lg");

    const colors: Record<string, string> = {
        A: "text-utility-brand-700",
        B: "text-utility-brand-500",
        C: "text-utility-gray-200",
    };

    return (
        <ResponsiveContainer className="h-60!">
            <RechartsBarChart
                data={barData}
                className="text-tertiary [&_.recharts-text]:text-xs"
                margin={{
                    left: 4,
                    right: 0,
                    top: isDesktop ? 12 : 6,
                    bottom: 18,
                }}
            >
                <CartesianGrid
                    vertical={false}
                    stroke="currentColor"
                    className="text-utility-gray-100"
                />

                <Legend
                    verticalAlign="top"
                    align="right"
                    layout={isDesktop ? "vertical" : "horizontal"}
                    content={<ChartLegendContent className="-translate-y-2" />}
                />

                <XAxis
                    fill="currentColor"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={11}
                    interval="preserveStartEnd"
                    dataKey="month"
                    tickFormatter={value => value.toLocaleDateString(undefined, { month: "short" })}
                >
                    <Label
                        value="Month"
                        fill="currentColor"
                        className="!text-xs font-medium"
                        position="bottom"
                    />
                </XAxis>

                <YAxis
                    fill="currentColor"
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    tickFormatter={value => Number(value).toLocaleString()}
                >
                    <Label
                        value="Active users"
                        fill="currentColor"
                        className="!text-xs font-medium"
                        style={{ textAnchor: "middle" }}
                        angle={-90}
                        position="insideLeft"
                    />
                </YAxis>

                <Tooltip
                    content={<ChartTooltipContent />}
                    formatter={value => Number(value).toLocaleString()}
                    labelFormatter={value =>
                        value.toLocaleDateString(undefined, { month: "short", year: "numeric" })
                    }
                    cursor={{
                        className: "fill-utility-gray-200/20",
                    }}
                />

                <Bar
                    isAnimationActive={false}
                    className={colors["A"]}
                    dataKey="A"
                    name="Series 1"
                    type="monotone"
                    stackId="a"
                    fill="currentColor"
                    maxBarSize={isDesktop ? 32 : 16}
                />
                <Bar
                    isAnimationActive={false}
                    className={colors["B"]}
                    dataKey="B"
                    name="Series 2"
                    type="monotone"
                    stackId="a"
                    fill="currentColor"
                    maxBarSize={isDesktop ? 32 : 16}
                />
                <Bar
                    isAnimationActive={false}
                    className={colors["C"]}
                    dataKey="C"
                    name="Series 3"
                    type="monotone"
                    stackId="a"
                    fill="currentColor"
                    maxBarSize={isDesktop ? 32 : 16}
                    radius={[6, 6, 0, 0]}
                />
            </RechartsBarChart>
        </ResponsiveContainer>
    );
};
                            `}
                        />
                    </div>
                </section>
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold mb-3 text-primary">Bar chart 02</h2>
                    <div className="space-y-4">
                        <div className="px-8 py-16 border border-tertiary rounded-xl">
                            <BarChart02 />
                        </div>

                        <CodeBlock
                            className="h-96 overflow-auto"
                            code={`import { useBreakpoint } from "@/lib/hooks/use-breakpoint";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Label,
  Line,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
export const BarChart02 = () => {
  const colors: Record<string, string> = {
    A: "text-utility-brand-600",
    B: "text-utility-brand-400",
  };

  const data = [
    { A: 633, B: 190, date: "2025-01-01" },
    { A: 443, B: 228, date: "2025-01-08" },
    { A: 506, B: 225, date: "2025-01-15" },
    { A: 316, B: 227, date: "2025-01-22" },
    { A: 760, B: 209, date: "2025-01-29" },
    { A: 950, B: 220, date: "2025-02-05" },
    { A: 760, B: 224, date: "2025-02-12" },
    { A: 570, B: 279, date: "2025-02-19" },
    { A: 253, B: 296, date: "2025-02-26" },
    { A: 380, B: 263, date: "2025-03-05" },
    { A: 443, B: 333, date: "2025-03-12" },
    { A: 443, B: 306, date: "2025-03-19" },
    { A: 316, B: 315, date: "2025-03-26" },
    { A: 190, B: 325, date: "2025-04-02" },
    { A: 380, B: 367, date: "2025-04-09" },
    { A: 506, B: 372, date: "2025-04-16" },
    { A: 443, B: 374, date: "2025-04-23" },
    { A: 696, B: 278, date: "2025-04-30" },
    { A: 950, B: 258, date: "2025-05-07" },
    { A: 633, B: 357, date: "2025-05-14" },
    { A: 570, B: 372, date: "2025-05-21" },
    { A: 253, B: 404, date: "2025-05-28" },
    { A: 316, B: 314, date: "2025-06-04" },
    { A: 380, B: 359, date: "2025-06-11" },
    { A: 253, B: 400, date: "2025-06-18" },
    { A: 190, B: 381, date: "2025-06-25" },
    { A: 316, B: 427, date: "2025-07-02" },
    { A: 633, B: 371, date: "2025-07-09" },
    { A: 570, B: 382, date: "2025-07-16" },
    { A: 760, B: 383, date: "2025-07-23" },
    { A: 950, B: 361, date: "2025-07-30" },
    { A: 696, B: 405, date: "2025-08-06" },
    { A: 570, B: 400, date: "2025-08-13" },
    { A: 443, B: 391, date: "2025-08-20" },
    { A: 316, B: 425, date: "2025-08-27" },
    { A: 253, B: 406, date: "2025-09-03" },
    { A: 380, B: 472, date: "2025-09-10" },
    { A: 633, B: 477, date: "2025-09-17" },
    { A: 570, B: 465, date: "2025-09-24" },
    { A: 443, B: 488, date: "2025-10-01" },
    { A: 380, B: 501, date: "2025-10-08" },
    { A: 316, B: 615, date: "2025-10-15" },
    { A: 570, B: 612, date: "2025-10-22" },
    { A: 506, B: 673, date: "2025-10-29" },
    { A: 443, B: 630, date: "2025-11-05" },
    { A: 760, B: 630, date: "2025-11-12" },
    { A: 443, B: 597, date: "2025-11-19" },
    { A: 506, B: 572, date: "2025-11-26" },
    { A: 316, B: 636, date: "2025-12-03" },
    { A: 633, B: 664, date: "2025-12-10" },
    { A: 380, B: 742, date: "2025-12-17" },
    { A: 633, B: 808, date: "2025-12-24" },
  ];

  return (
    <div className="flex h-60 flex-col gap-2">
      <ResponsiveContainer className="h-full">
        <ComposedChart
          data={data}
          margin={{
            left: 4,
            right: 0,
            top: 12,
            bottom: 18,
          }}
          className="text-tertiary [&_.recharts-text]:text-xs"
        >
          <CartesianGrid
            vertical={false}
            stroke="currentColor"
            className="text-utility-gray-100"
          />

          <XAxis
            fill="currentColor"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            interval="preserveStartEnd"
            dataKey="date"
            tickFormatter={value =>
              new Date(value).toLocaleDateString(undefined, { month: "short" })
            }
            ticks={selectEvenlySpacedItems(data, 12).map(item => item.date)}
          >
            <Label
              value="Month"
              fill="currentColor"
              className="!text-xs font-medium"
              position="bottom"
            />
          </XAxis>

          <YAxis
            fill="currentColor"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            tickFormatter={value => Number(value).toLocaleString()}
          >
            <Label
              value="Active users"
              fill="currentColor"
              className="!text-xs font-medium"
              style={{ textAnchor: "middle" }}
              angle={-90}
              position="insideLeft"
            />
          </YAxis>

          <Tooltip
            content={<ChartTooltipContent />}
            formatter={value => Number(value).toLocaleString()}
            // Custom label formatter to show the week range
            labelFormatter={value => {
              const date = new Date(value);
              const endDate = new Date(date);
              endDate.setDate(date.getDate() + 6); // Set end date to 7 days after start date

              // If the start and end dates are in the same month, shorten the label (Jun 1-7, 2025)
              if (date.getMonth() === endDate.getMonth()) {
                return \`\${date.toLocaleDateString(undefined, { month: "long" })} \${date.getDate()}-\${endDate.getDate()}, \${endDate.getFullYear()}\`;
              }

              // Otherwise, show the full month range (May 30 - Jun 5, 2025)
              return \`\${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - \${endDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}\`;
            }}
            cursor={{
              className: "fill-utility-gray-200/20",
            }}
          />

          <Bar
            isAnimationActive={false}
            className={colors["A"]}
            name="Mobile"
            dataKey="A"
            type="monotone"
            stackId="a"
            fill="currentColor"
            maxBarSize={12}
            radius={[4, 4, 0, 0]}
          />
          <Line
            isAnimationActive={false}
            className={colors["B"]}
            dataKey="B"
            name="Desktop"
            type="monotone"
            stroke="currentColor"
            strokeWidth={2}
            strokeDasharray="0.1 8"
            strokeLinecap="round"
            activeDot={false}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};`}
                        />
                    </div>
                </section>
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold mb-3 text-primary">Activity gauge</h2>
                    <div className="space-y-4">
                        <div className="px-8 py-16 border border-tertiary rounded-xl">
                            <ActivityGauge />
                        </div>

                        <CodeBlock
                            className="h-96 overflow-auto"
                            code={`
import {
    Legend,
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { ChartLegendContent, ChartTooltipContent } from "./base";
import { cn } from "@/lib/utils/cn";

const radialData = [
    {
        name: "Series 3",
        value: 660,
        className: "text-utility-brand-400",
    },
    {
        name: "Series 2",
        value: 774,
        className: "text-utility-brand-600",
    },
    {
        name: "Series 1",
        value: 866,
        className: "text-utility-brand-700",
    },
];

interface ActivityGaugeProps {
    title?: string;
    subtitle?: string;
    data?: Array<{
        name: string;
        value: number;
        className: string;
    }>;
    size?: "xs" | "sm" | "md" | "lg";
}

const sizeStyles = {
    xs: {
        height: 220,
        innerRadius: 52,
        outerRadius: 86,
        subtitledy: "-1.175em",
        titledy: "1.25em",
        subtitleFontSize: "text-xs",
        titleFontSize: "text-xl",
    },
    sm: {
        height: 268,
        innerRadius: 61,
        outerRadius: 110,
        subtitledy: "-1.35em",
        titledy: "1.15em",
        subtitleFontSize: "text-xs",
        titleFontSize: "text-display-xs",
    },
    md: {
        height: 312,
        innerRadius: 74,
        outerRadius: 132,
        subtitledy: "-1.45em",
        titledy: "1.075em",
        subtitleFontSize: "text-sm",
        titleFontSize: "text-display-sm",
    },
    lg: {
        height: 356,
        innerRadius: 84,
        outerRadius: 154,
        subtitledy: "-1.4em",
        titledy: "1em",
        subtitleFontSize: "text-sm",
        titleFontSize: "text-display-md",
    },
};

export const ActivityGauge = ({
    title = "1,000",
    subtitle = "Active users",
    data = radialData,
    size = "sm",
}: ActivityGaugeProps) => {
    return (
        <ResponsiveContainer height={sizeStyles[size].height}>
            <RadialBarChart
                data={data}
                accessibilityLayer
                innerRadius={sizeStyles[size].innerRadius}
                outerRadius={sizeStyles[size].outerRadius}
                // This is needed to start the chart at the top and go clockwise
                startAngle={90}
                endAngle={360 + 90}
                className="font-medium text-tertiary [&_.recharts-polar-grid]:text-utility-gray-100 [&_.recharts-text]:text-sm"
                margin={{
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <PolarAngleAxis tick={false} domain={[0, 1000]} type="number" reversed />

                <Legend
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    content={<ChartLegendContent />}
                />

                <Tooltip content={<ChartTooltipContent isRadialChart />} />

                <RadialBar
                    isAnimationActive={false}
                    dataKey="value"
                    cornerRadius={99}
                    fill="currentColor"
                    background={{
                        className: "fill-utility-gray-100",
                    }}
                />

                {(title || subtitle) && (
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                        {subtitle && (
                            <tspan
                                x="50%"
                                dy={title ? sizeStyles[size].subtitledy : "1%"}
                                className={cn(
                                    "fill-current text-tertiary font-medium",
                                    sizeStyles[size].subtitleFontSize
                                )}
                            >
                                {subtitle}
                            </tspan>
                        )}
                        {title && (
                            <tspan
                                x="50%"
                                dy={subtitle ? sizeStyles[size].titledy : "1%"}
                                className={cn(
                                    "fill-current text-primary font-semibold",
                                    sizeStyles[size].titleFontSize
                                )}
                            >
                                {title}
                            </tspan>
                        )}
                    </text>
                )}
            </RadialBarChart>
        </ResponsiveContainer>
    );
};
                            `}
                        />
                    </div>
                </section>
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold mb-3 text-primary">Pie</h2>
                    <div className="space-y-4">
                        <div className="px-8 py-16 border border-tertiary rounded-xl">
                            <PieChart size="sm" />
                        </div>

                        <CodeBlock
                            className="h-96 overflow-auto"
                            code={`
import { Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartLegendContent, ChartTooltipContent } from "./base";

interface PieChartProps {
    data?: Array<{
        name: string;
        value: number;
        className: string;
    }>;
    size: "xxs" | "xs" | "sm" | "md" | "lg";
}

const pieChartData = [
    {
        name: "Series 1",
        value: 200,
        className: "text-utility-brand-600",
    },
    {
        name: "Series 2",
        value: 350,
        className: "text-utility-brand-500",
    },
    {
        name: "Series 3",
        value: 100,
        className: "text-utility-brand-400",
    },
    {
        name: "Series 4",
        value: 120,
        className: "text-utility-brand-300",
    },
    {
        name: "Series 5",
        value: 230,
        className: "text-utility-gray-200",
    },
];

const sizeStyles = {
    xxs: {
        height: 120,
        with: "max-w-52.5",
        innerRadius: 30,
        outerRadius: 60,
    },
    xs: {
        height: 160,
        with: "max-w-62.5",
        innerRadius: 40,
        outerRadius: 80,
    },
    sm: {
        height: 200,
        with: "max-w-72.5",
        innerRadius: 50,
        outerRadius: 100,
    },
    md: {
        height: 240,
        with: "max-w-96",
        innerRadius: 60,
        outerRadius: 120,
    },
    lg: {
        height: 280,
        with: "max-w-96",
        innerRadius: 70,
        outerRadius: 140,
    },
};

export const PieChart = ({ data = pieChartData, size = "sm" }: PieChartProps) => {
    return (
        <ResponsiveContainer height={sizeStyles[size].height} className={sizeStyles[size].with}>
            <RechartsPieChart
                margin={{
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <Legend
                    verticalAlign="top"
                    align="right"
                    layout="vertical"
                    content={ChartLegendContent}
                />
                <Tooltip content={<ChartTooltipContent isPieChart />} />

                <Pie
                    isAnimationActive={false}
                    startAngle={-270}
                    endAngle={-630}
                    stroke="none"
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    fill="currentColor"
                    innerRadius={sizeStyles[size].innerRadius}
                    outerRadius={sizeStyles[size].outerRadius}
                />
            </RechartsPieChart>
        </ResponsiveContainer>
    );
};

                            `}
                        />
                    </div>
                </section>
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold mb-3 text-primary">Radar</h2>
                    <div className="space-y-4">
                        <div className="px-8 py-16 border border-tertiary rounded-xl">
                            <RadarChart />
                        </div>

                        <CodeBlock
                            className="h-96 overflow-auto"
                            code={`
import {
    Legend,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart as RechartsRadarChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { ChartLegendContent, ChartTooltipContent, CustomRadarChartTick } from "./base";
import { cn } from "@/lib/utils/cn";

const radarData = [
    {
        subject: "Mon",
        A: 800,
        B: 400,
        C: 600,
    },
    {
        subject: "Tue",
        A: 600,
        B: 1000,
        C: 800,
    },
    {
        subject: "Wed",
        A: 600,
        B: 200,
        C: 400,
    },
    {
        subject: "Thu",
        A: 200,
        B: 600,
        C: 800,
    },
    {
        subject: "Fri",
        A: 400,
        B: 200,
        C: 600,
    },
    {
        subject: "Sat",
        A: 1000,
        B: 800,
        C: 600,
    },
    {
        subject: "Sun",
        A: 400,
        B: 1000,
        C: 800,
    },
];

export const RadarChart = () => {
    const colors: Record<string, string> = {
        A: "text-utility-brand-600",
        B: "text-utility-pink-500",
        C: "text-utility-blue-light-500",
    };

    return (
        <ResponsiveContainer height={500} width="100%">
            <RechartsRadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={radarData}
                className="size-full font-medium text-tertiary [&_.recharts-polar-grid]:text-utility-gray-100 [&_.recharts-text]:text-sm"
                margin={{
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <Legend
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    content={ChartLegendContent}
                />

                <PolarGrid stroke="currentColor" className="text-utility-gray-100" />
                <PolarAngleAxis
                    dataKey="subject"
                    stroke="currentColor"
                    tick={({ x, y, textAnchor, index, payload, ...props }) => (
                        <text
                            x={x}
                            y={
                                index === 0
                                    ? Number(y) - 14
                                    : index === 3 || index === 4
                                      ? Number(y) + 10
                                      : Number(y)
                            }
                            textAnchor={textAnchor}
                            {...props}
                            className={cn(
                                "recharts-text recharts-polar-angle-axis-tick-value",
                                props.className
                            )}
                        >
                            <tspan dy="0em" className="fill-utility-gray-700 text-xs font-medium">
                                {payload.value}
                            </tspan>
                        </text>
                    )}
                    tickLine={false}
                    axisLine={false}
                />
                <PolarRadiusAxis
                    textAnchor="middle"
                    tick={props => <CustomRadarChartTick {...props} />}
                    axisLine={false}
                    angle={90}
                    domain={[0, 1000]}
                />

                <Tooltip
                    content={<ChartTooltipContent />}
                    cursor={{
                        className: "stroke-utility-brand-600  stroke-2",
                        style: {
                            transform: "translateZ(0)",
                        },
                    }}
                />

                <Radar
                    isAnimationActive={false}
                    className={colors["A"]}
                    dataKey="A"
                    name="Series 1"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    fill="currentColor"
                    fillOpacity={0.2}
                    activeDot={{
                        className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                    }}
                />
                <Radar
                    isAnimationActive={false}
                    className={colors["B"]}
                    dataKey="B"
                    name="Series 2"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    fill="currentColor"
                    fillOpacity={0.2}
                    activeDot={{
                        className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                    }}
                />
                <Radar
                    isAnimationActive={false}
                    className={colors["C"]}
                    dataKey="C"
                    name="Series 3"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    fill="currentColor"
                    fillOpacity={0.2}
                    activeDot={{
                        className: "fill-bg-primary stroke-utility-brand-600 stroke-2",
                    }}
                />
            </RechartsRadarChart>
        </ResponsiveContainer>
    );
};

                            `}
                        />
                    </div>
                </section>

                {/* API Reference */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-3 text-gray-900">API Reference</h2>
                        <p className="text-tertiary mb-6">
                            Available props and utility components for chart customization.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Prop
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Description
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Default
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-primary">data</code>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        Array&lt;object&gt;
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        Data array used to render chart series.
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-gray-800">[]</code>
                                    </td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-primary">
                                            ChartLegendContent
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        React component
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        Custom legend renderer supporting Tailwind variants.
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-gray-800">—</code>
                                    </td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-primary">
                                            ChartTooltipContent
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        React component
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tertiary">
                                        Custom tooltip renderer for improved data presentation.
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm font-mono text-gray-800">—</code>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
}
