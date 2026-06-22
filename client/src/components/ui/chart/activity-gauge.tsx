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
