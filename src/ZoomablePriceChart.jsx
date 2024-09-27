import { useState, useMemo, useRef, useEffect } from "react";
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
  generateRandomChartData,
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

export const description = "A step area chart with zoom functionality";

const startDate = "2024-05-10";
const endDate = "2024-09-15";
const rawData = generateRandomChartData(startDate, endDate);

// const rawData=[]

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
  const prevSelectedOptionRef = useRef(selectedOption);

  // Memoized filtered data based on selected option
  const filteredData = useMemo(() => {
    let data = filterChartData(allData, selectedOption);
    setEndTime(null)
    setStartTime(null)
    return data.length > 1 ? data : allData.slice(0, 2);
  }, [selectedOption]);

  // Apply zoom to filtered data
  const zoomedData = useMemo(() => {
    if (
      startTime &&
      endTime &&
      prevSelectedOptionRef.current === selectedOption
    ) {
      return filteredData.filter(
        (item) => item.date >= startTime && item.date <= endTime
      );
    }
    return filteredData;
  }, [filteredData, startTime, endTime, selectedOption]);

  // Update prevSelectedOptionRef when selectedOption changes
  useEffect(() => {
    prevSelectedOptionRef.current = selectedOption;
  }, [selectedOption]);

  // Extracting prices to determine Y-axis range
  const prices = zoomedData.map((item) => item.price);
  const maxPrice = Math.max(...prices);

  // Generating Y-axis ticks
  const priceRangeArray = generatePriceRange(0, maxPrice, 10);

  // Generating X-axis ticks based on zoomed data
  const xAxisTicks = generateXAxisTicks(zoomedData, selectedOption);
  console.log(xAxisTicks)

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
                borderRadius: "14px",
                border: "1px solid transparent",
                padding: "2px 10px",
                fontSize: "10px",
                fontWeight: 600,
                backgroundColor: "rgb(50 50 54)",
                color: "white",
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
            data={zoomedData}
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
              ticks={xAxisTicks.map((tick) => tick.date)}
              tickFormatter={(tick) => {
                const matchingTick = xAxisTicks.find((t) => t.date === tick);
                return matchingTick ? matchingTick.label : "";
              }}
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
