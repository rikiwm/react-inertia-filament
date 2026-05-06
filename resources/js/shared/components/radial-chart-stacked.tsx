"use client"

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart"
import { formatRupiahCompact } from "@/Lib/formatters"

interface RadialChartStackedProps {
  anggaran: number
  realisasi: number
  title?: string
  description?: string
}

export function RadialChartStacked({ anggaran, realisasi, title = "Total Capaian", description = "Anggaran vs Realisasi" }: RadialChartStackedProps) {
  const sisa = Math.max(0, anggaran - realisasi)
  const percentage = anggaran > 0 ? (realisasi / anggaran) * 100 : 0

  const chartData = [{ category: "status", realisasi: realisasi, sisa: sisa }]

  const chartConfig = {
    realisasi: {
      label: "Realisasi",
      theme: {
        light: "#0d9488", // teal-600
        dark: "#2dd4bf",  // teal-400
      }
    },
    sisa: {
      label: "Sisa",
      theme: {
        light: "#232323ff", // neutral-200
        dark: "#c8c8c87d",  // neutral-800
      }
    },
  } satisfies ChartConfig

  return (
    <div className="flex flex-col bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
      <div className="flex flex-col items-center pb-0">
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">{title}</h3>
        <p className="text-[10px] text-neutral-500 font-medium">{description}</p>
      </div>
      <div className="flex-1 pt-2">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            innerRadius={60}
            outerRadius={120}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-neutral-900 dark:fill-neutral-100 text-2xl font-bold"
                        >
                          {percentage.toFixed(1)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-neutral-500 dark:fill-neutral-400 text-[10px] font-medium"
                        >
                          Capaian
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="realisasi"
              stackId="a"
              cornerRadius={10}
              fill="var(--color-realisasi)"
              className="stroke-transparent stroke-0"
            />
            <RadialBar
              dataKey="sisa"
              fill="var(--color-sisa)"
              stackId="a"
              cornerRadius={10}
              className="stroke-transparent stroke-0"
            />
          </RadialBarChart>
        </ChartContainer>
      </div>
      <div className="flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between font-medium leading-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-600" />
            <span className="text-neutral-600 dark:text-neutral-400">Realisasi</span>
          </div>
          <span className="text-neutral-900 dark:text-neutral-100">{formatRupiahCompact(realisasi)}</span>
        </div>
        <div className="flex items-center justify-between font-medium leading-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <span className="text-neutral-600 dark:text-neutral-400">Total Anggaran</span>
          </div>
          <span className="text-neutral-900 dark:text-neutral-100">{formatRupiahCompact(anggaran)}</span>
        </div>
      </div>
    </div>
  )
}
