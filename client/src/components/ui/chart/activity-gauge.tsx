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
    size?: "xs" | "sm";
}

const sizeStyles = {
    xs: {
        height: 220,
        innerRadius: 52,
        outerRadius: 86,
        subtitleSize: "-1.175em",
        titleSize: "1.25em",
    },
    sm: {
        height: 268,
        innerRadius: 61,
        outerRadius: 110,
        subtitleSize: "-1.35em",
        titleSize: "1.15em",
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
                                dy={title ? "-1.175em" : "1%"}
                                className={cn("fill-current text-tertiary", "text-xs font-medium")}
                            >
                                {subtitle}
                            </tspan>
                        )}
                        {title && (
                            <tspan
                                x="50%"
                                dy={subtitle ? "1.25em" : "1%"}
                                className={cn("fill-current text-primary", "text-xl font-semibold")}
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
