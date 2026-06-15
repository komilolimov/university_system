"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendData {
  name: string;
  enrollments: number;
}

interface EnrollmentTrendsChartProps {
  data: TrendData[];
}

export const EnrollmentTrendsChart = ({ data }: EnrollmentTrendsChartProps) => {
  // Use a fallback if no data is provided from backend yet
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    return [
      { name: "Fall 2023", enrollments: 120 },
      { name: "Spring 2024", enrollments: 200 },
      { name: "Fall 2024", enrollments: 150 },
      { name: "Spring 2025", enrollments: 320 },
      { name: "Fall 2025", enrollments: 280 },
    ];
  }, [data]);

  return (
    <div className="bg-white border border-neutral-200/60 p-6 rounded-xl shadow-sm flex flex-col gap-6">
      <div className="flex flex-col gap-1 select-none">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
          Enrollment Trends
        </h2>
        <p className="text-xs font-medium text-neutral-500">
          Student registrations across academic terms
        </p>
      </div>

      <div className="h-[300px] w-full text-xs font-sans">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#000000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#737373" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#737373" }}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e5e5",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                fontSize: "12px",
                fontWeight: 500,
              }}
              itemStyle={{ color: "#000000" }}
            />
            <Area
              type="monotone"
              dataKey="enrollments"
              stroke="#000000"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEnrollments)"
              activeDot={{ r: 4, fill: "#000000", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
