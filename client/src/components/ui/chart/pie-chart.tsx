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
