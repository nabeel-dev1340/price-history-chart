import { useState, useMemo, useRef, useEffect } from "react";
import { Activity, X } from "lucide-react";
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
import ExpandIcon from "./Icons/ExpandIcon";

export const description =
  "A step area chart with zoom functionality and expand modal";

const startDate = "2024-05-10";
const endDate = "2024-09-15";
const rawData = generateRandomChartData(startDate, endDate);

const allData = fillMissingDates(rawData);

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#0171DC",
    icon: Activity,
  },
};

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      id="price-chart-expanded"
      className="absolute top-[120px] right-[600px] z-50"
    >
      <div
        className="flex flex-col items-center bg-white rounded-[12px] relative border border-slate-200"
        style={{ width: "1100px", paddingTop: "10px" }}
      >
        <button
          onClick={onClose}
          style={{ marginRight: "10px", marginBottom: "10px" }}
          className="self-end text-gray-500 hover:text-gray-700 mr-[10px]"
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

const ChartComponent = ({ isExpanded = false, onExpand }) => {
  const [selectedOption, setSelectedOption] = useState("option-two");
  const [refAreaLeft, setRefAreaLeft] = useState(null);
  const [refAreaRight, setRefAreaRight] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const prevSelectedOptionRef = useRef(selectedOption);

  const filteredData = useMemo(() => {
    let data = filterChartData(allData, selectedOption);
    setEndTime(null);
    setStartTime(null);
    return data.length > 1 ? data : allData.slice(0, 2);
  }, [selectedOption]);

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

  useEffect(() => {
    prevSelectedOptionRef.current = selectedOption;
  }, [selectedOption]);

  const prices = zoomedData.map((item) => item.price);
  const maxPrice = Math.max(...prices);

  const priceRangeArray = generatePriceRange(0, maxPrice, 10);

  const xAxisTicks = generateXAxisTicks(zoomedData, selectedOption);

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

  const handleReset = () => {
    setStartTime(null);
    setEndTime(null);
  };

  const cardPadding = isExpanded ? "0" : "10px";

  return (
    <Card style={{ padding: cardPadding }}>
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
          {!isExpanded && (
            <button
              onClick={onExpand}
              size="sm"
              style={{ padding: "4px", borderRadius: "5px" }}
              className="border border-slate-300"
              id="price-chart-modal"
            >
              {/* <ExternalLink size={14} /> */}
              <ExpandIcon size={17} />
            </button>
          )}
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger
              style={{
                width: "100px",
                borderRadius: "0.5rem",
                marginLeft: "auto",
                fontFamily: "Poppins",
                padding: "5px",
                fontSize: "10px",
                height: "30px",
              }}
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last Year" />
            </SelectTrigger>
            <SelectContent
              style={{
                borderRadius: "0.75rem",
                fontFamily: "Poppins",
                width: "120px",
              }}
            >
              <SelectItem
                value="option-one"
                style={{ borderRadius: "0.5rem", fontSize: "10px" }}
              >
                3 months
              </SelectItem>
              <SelectItem
                value="option-two"
                style={{ borderRadius: "0.5rem", fontSize: "10px" }}
              >
                Year
              </SelectItem>
              <SelectItem
                value="option-three"
                style={{ borderRadius: "0.5rem", fontSize: "10px" }}
              >
                {`All (${allData?.length} Days)`}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent style={{ userSelect: "none" }}>
        <ChartContainer
          config={chartConfig}
          width={isExpanded ? "1100px" : "500px"}
          height={isExpanded ? "400px" : "120px"}
        >
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
};

export function ZoomableAreaChart() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ChartComponent
        onExpand={() => {
          console.log("model oe");
          setIsModalOpen(true);
        }}
      />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ChartComponent isExpanded={true} />
      </Modal>
    </>
  );
}
