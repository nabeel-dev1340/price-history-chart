"use client";
import { useState, useMemo, useRef } from "react";
import { Activity } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceArea,
} from "recharts";
import {
  fillMissingDates,
  // generateRandomChartData,
  filterChartData,
  generatePriceRange,
  generateXAxisTicks,
} from "./lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const description = "A step area chart with zoom functionality";

// const startDate = "2024-05-10";
// const endDate = "2024-09-15";
// const rawData = generateRandomChartData(startDate, endDate);

const rawData = [];
const allData = fillMissingDates(rawData);

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#0171DC",
    icon: Activity,
  },
};

export function ZoomableAreaChart() {
  const [selectedOption, setSelectedOption] = useState("option-two");
  const [refAreaLeft, setRefAreaLeft] = useState(null);
  const [refAreaRight, setRefAreaRight] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Memoized filtered data based on selected option and zoom range
  const filteredData = useMemo(() => {
    let data = filterChartData(allData, selectedOption);
    if (startTime && endTime) {
      data = data.filter(
        (item) => item.date >= startTime && item.date <= endTime
      );
    }
    return data.length > 1 ? data : allData.slice(0, 2);
  }, [selectedOption, startTime, endTime]); 

  // Extracting prices to determine Y-axis range
  const prices = allData.map((item) => item.price);
  const maxPrice = Math.max(...prices);

  // Generating Y-axis ticks
  const priceRangeArray = generatePriceRange(0, maxPrice, 10);

  // Generating X-axis ticks based on filtered data
  const xAxisTicks = generateXAxisTicks(filteredData, selectedOption);

  // Handle Mouse Events for Selection
  const handleMouseDown = (e) => {
    if (e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
      setIsSelecting(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isSelecting && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  };

  const handleMouseUp = () => {
    if (refAreaLeft && refAreaRight) {
      const [left, right] = [refAreaLeft, refAreaRight].sort();
      setStartTime(left);
      setEndTime(right);
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  };

  // Reset Zoom to Default View
  const handleReset = () => {
    setStartTime(null);
    setEndTime(null);
  };

  // Formatting X-Axis Labels
  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card style={{ padding: "10px", height: "190px" }}>
      <CardHeader
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          paddingBottom: "1.25rem",
          flexDirection: "row",
        }}
      >
        <div
          style={{
            display: "grid",
            flex: "1",
            gap: "0.25rem",
            textAlign: "left",
            fontFamily: "Poppins",
            fontSize: "14px",
          }}
        >
          <CardTitle>Lowest Price History</CardTitle>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexDirection: "row",
            fontFamily: "Poppins",
          }}
        >
          {startTime && endTime && (
            <div
              onClick={handleReset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: "14px", // 6px equivalent to rounded-md
                border: "1px solid transparent",
                padding: "2px 10px", // px-[15px] py-[5px]
                fontSize: "10px", // text-xs
                fontWeight: 600, // font-semibold
                backgroundColor: "rgb(50 50 54)",
                color: "white", // Text color set to white
                transition: "background-color 0.2s",
                cursor: "pointer",
                outline: "none",
              }}
            >
              Reset
            </div>
          )}
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger
              style={{
                width: "120px",
                borderRadius: "0.5rem",
                marginLeft: "auto",
                fontFamily: "Poppins",
                padding: "5px",
                fontSize: "12px",
              }}
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last Year" />
            </SelectTrigger>
            <SelectContent
              style={{
                borderRadius: "0.75rem",
                fontFamily: "Poppins",
                width: "135px",
              }}
            >
              <SelectItem
                value="option-one"
                style={{ borderRadius: "0.5rem", fontSize: "12px" }}
              >
                3 months
              </SelectItem>
              <SelectItem
                value="option-two"
                style={{ borderRadius: "0.5rem", fontSize: "12px" }}
              >
                Year
              </SelectItem>
              <SelectItem
                value="option-three"
                style={{ borderRadius: "0.5rem", fontSize: "12px" }}
              >
                {`All (${allData?.length} Days)`}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              ticks={xAxisTicks}
              tickFormatter={formatXAxis}
            />
            <YAxis
              dataKey="price"
              axisLine={false}
              tickLine={false}
              tickMargin={2}
              ticks={priceRangeArray}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="price"
              type="step"
              fill="var(--color-desktop)"
              fillOpacity={0.5}
              stroke="var(--color-desktop)"
            />
            {refAreaLeft && refAreaRight && (
              <ReferenceArea
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.3}
                fill="hsl(var(--foreground))"
                fillOpacity={0.05}
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
