import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function generateRandomChartData(startDate, endDate) {
  const chartData = [];
  let currentDate = new Date(startDate);
  const finalDate = new Date(endDate);

  while (currentDate <= finalDate) {
    // Format the date as YYYY-MM-DD
    const dateString = currentDate.toISOString().split("T")[0];

    // Generate a random price between 50 and 200
    const randomPrice = Math.floor(Math.random() * 151) + 50;

    // Add the data point to the array
    chartData.push({
      date: dateString,
      price: randomPrice,
    });

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return chartData;
}

// Utility function to parse and format dates
function formatDate(date) {
  return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
}

// Utility function to add a day to a date
function addOneDay(date) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1);
  return newDate;
}

// Function to fill missing dates with the last available price
export function fillMissingDates(data) {
  // Step 1: Sort the data by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const filledData = [];
  let previousPrice = sortedData[0].price; // Start with the first price

  for (let i = 0; i < sortedData.length - 1; i++) {
    const currentEntry = sortedData[i];
    const nextEntry = sortedData[i + 1];

    // Push the current entry to the filled data
    filledData.push(currentEntry);

    let currentDate = new Date(currentEntry.date);
    let nextDate = new Date(nextEntry.date);

    // Step 2: Fill missing dates
    while (formatDate(addOneDay(currentDate)) !== formatDate(nextDate)) {
      currentDate = addOneDay(currentDate);

      // Push the missing date with the last known price
      filledData.push({
        date: formatDate(currentDate),
        price: previousPrice,
      });
    }

    // Update the previous price to the current entry's price
    previousPrice = currentEntry.price;
  }

  // Push the last entry (after the loop ends)
  filledData.push(sortedData[sortedData.length - 1]);

  return filledData;
}

export const generatePriceRange = (min, max, interval) => {
  const priceRange = [];

  // Calculate the adjusted max to include an extra interval
  const adjustedMax = max + interval;

  for (let i = min; i <= adjustedMax; i += interval) {
    priceRange.push(i);
  }

  return priceRange;
};

export function filterChartData(allData, option) {
  // Get the latest date in the data
  const latestDate = new Date(allData[allData.length - 1].date);
  let filteredData = [];

  if (option === "option-one") {
    // For "3 months" option
    const threeMonthsAgo = new Date(latestDate);
    threeMonthsAgo.setMonth(latestDate.getMonth() - 3);
    filteredData = allData.filter(
      (data) => new Date(data.date) >= threeMonthsAgo
    );
  } else if (option === "option-two") {
    // For "year" option: get data from exactly one year back
    const oneYearAgo = new Date(latestDate);
    oneYearAgo.setFullYear(latestDate.getFullYear() - 1);
    filteredData = allData.filter(
      (data) =>
        new Date(data.date) >= oneYearAgo && new Date(data.date) <= latestDate
    );
  } else if (option === "option-three") {
    // For "All" option: Show all data
    filteredData = allData;
  }

  return filteredData;
}
// Helper functions
function formatDateMonthDay(date) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function formatDateMonthYear(date) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Main function to generate X-axis ticks
export function generateXAxisTicks(filteredData, selectedOption, interval = 4) {
  const dataLength = filteredData.length;

  if (dataLength === 0) return [];

  const dates = filteredData.map((data) => new Date(data.date));
  const firstDate = new Date(Math.min(...dates));
  const lastDate = new Date(Math.max(...dates));

  // Calculate the number of months between first and last date
  const monthsDiff =
    (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
    (lastDate.getMonth() - firstDate.getMonth());

  if (selectedOption === "option-one") {
    // 3 months, so we want interval ticks
    if (monthsDiff < 2) {
      return generateDayTicks(firstDate, lastDate, interval);
    }

    return generateAllMonthTicks(firstDate, lastDate, interval);
  } else {
    // Check if it's a full year
    const isFullYear = monthsDiff >= 11 && monthsDiff <= 13;

    if (isFullYear) {
      return generateFullYearTicks(firstDate, interval);
    } else if (monthsDiff >= interval) {
      return generateIntervalTicks(firstDate, lastDate, interval);
    } else if (monthsDiff <= (interval/2)) {
      return generateDayTicks(firstDate, lastDate, interval);
    } else {
      return generateAllMonthTicks(firstDate, lastDate,interval);
    }
  }
}
function generateDayTicks(startDate, endDate, interval) {
  const ticks = [];
  const totalMilliseconds = endDate - startDate;
  const daysDifference =
    Math.ceil(totalMilliseconds / (1000 * 60 * 60 * 24)) + 1;

  // If interval or fewer days, generate a tick for each day
  if (daysDifference <= interval) {
    for (let i = 0; i < daysDifference; i++) {
      const tickDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      ticks.push({
        date: tickDate.toISOString().split("T")[0],
        label: formatDateMonthDay(tickDate),
      });
    }
  } else {
    // Generate ticks based on the interval
    for (let i = 0; i < interval; i++) {
      const tickDate = new Date(
        startDate.getTime() + (i / (interval - 1)) * totalMilliseconds
      );
      ticks.push({
        date: tickDate.toISOString().split("T")[0],
        label: formatDateMonthDay(tickDate),
      });
    }
  }

  return ticks;
}

function generateMonthTicks(startDate, endDate, interval) {
  const ticks = [];
  const adjustedStartDate = new Date(startDate);
  adjustedStartDate.setDate(startDate.getDate() + 10);
  const adjustedEndDate = new Date(endDate);
  adjustedEndDate.setDate(endDate.getDate() - 10);

  const totalMonths =
    (adjustedEndDate.getFullYear() - adjustedStartDate.getFullYear()) * 12 +
    (adjustedEndDate.getMonth() - adjustedStartDate.getMonth());

  const monthStep = Math.max(1, Math.floor(totalMonths / (interval - 1)));

  for (let i = 0; i < interval; i++) {
    const currentDate = new Date(adjustedStartDate);
    currentDate.setMonth(adjustedStartDate.getMonth() + i * monthStep);
    if (currentDate <= adjustedEndDate) {
      ticks.push({
        date: currentDate.toISOString().split("T")[0],
        label: formatDateMonthYear(currentDate),
      });
    }
  }

  return ticks;
}

function generateFullYearTicks(startDate, interval) {
  const months = [];
  const tickStartDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    1
  );
  const monthStep = Math.max(1, Math.floor(12 / interval));

  for (let i = 0; i < 12; i += monthStep) {
    const date = new Date(
      tickStartDate.getFullYear(),
      tickStartDate.getMonth() + i,
      1
    );
    months.push({
      date: date.toISOString().split("T")[0],
      label: formatDateMonthYear(date),
    });
  }
  return months;
}

function generateIntervalTicks(startDate, endDate, interval) {
  const ticks = [];
  const totalDays = (endDate - startDate) / (24 * 60 * 60 * 1000);
  const tickInterval = totalDays / (interval - 1);

  for (let i = 0; i < interval; i++) {
    const tickDate = new Date(
      startDate.getTime() + i * tickInterval * 24 * 60 * 60 * 1000
    );
    ticks.push({
      date: tickDate.toISOString().split("T")[0],
      label: formatDateMonthYear(tickDate),
    });
  }

  return ticks;
}

function generateAllMonthTicks(startDate, endDate, interval) {
  const ticks = [];
  if (interval > 4) {
    const totalMilliseconds = endDate - startDate;
    // Generate ticks based on the interval
    for (let i = 0; i < interval; i++) {
      const tickDate = new Date(
        startDate.getTime() + (i / (interval - 1)) * totalMilliseconds
      );
      ticks.push({
        date: tickDate.toISOString().split("T")[0],
        label: formatDateMonthDay(tickDate),
      });
    }
  } else {
    let currentDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1
    );

    while (currentDate <= endDate) {
      ticks.push({
        date: currentDate.toISOString().split("T")[0],
        label: formatDateMonthYear(currentDate),
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return ticks;
}
