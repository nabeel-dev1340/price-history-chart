import { useState } from "react";
import { Activity } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

export const description = "A step area chart";

// const startDate = "2024-5-10";
// const endDate = "2024-09-15";
// const rawData = generateRandomChartData(startDate, endDate);

const rawData=[];

const allData = fillMissingDates(rawData);

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#0171DC",
    icon: Activity,
  },
};

export function HistoricalPriceChart() {
  const [selectedOption, setSelectedOption] = useState("option-two");

  const filteredData = filterChartData(allData, selectedOption);

  const prices = allData.map((item) => item.price);
  const maxPrice = Math.max(...prices);

  // Call the function to create the price range array (these are y-axis ticks)
  const priceRangeArray = generatePriceRange(0, maxPrice, 10);
  // generate x-axis ticks based on filtered data
  const xAxisTicks = generateXAxisTicks(filteredData, selectedOption);
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
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
            }}
            // onMouseMove={(e) => {
            //   setActiveTipIndex(e.activeTooltipIndex);
            // }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              ticks={xAxisTicks}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                });
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
              // active={activeTooltipIndexes.indexOf(activeTipIndex) !== -1}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="price"
              type="step"
              fill="var(--color-desktop)"
              fillOpacity={0.5}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
