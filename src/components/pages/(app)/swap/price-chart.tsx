"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  ColorType,
  CandlestickSeries,
  type CandlestickData,
  type UTCTimestamp,
} from "lightweight-charts";

// Generate mock candlestick data based on token pair
function generateMockCandles(
  seed: string,
  anchorPrice?: number,
  count = 90
): CandlestickData[] {
  let s = 0;
  for (let i = 0; i < seed.length; i++) {
    s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };

  const candles: CandlestickData[] = [];
  let price = 0.1 + rand() * 0.6;
  const now = Math.floor(Date.now() / 1000);
  const hourInSeconds = 3600;

  for (let i = count - 1; i >= 0; i--) {
    const open = price;
    const close = Math.max(0.0001, price + (rand() - 0.5) * price * 0.07);
    const high = Math.max(open, close) * (1 + rand() * 0.02);
    const low = Math.min(open, close) * (1 - rand() * 0.02);

    candles.push({
      time: (now - i * hourInSeconds) as UTCTimestamp,
      open,
      high,
      low,
      close,
    });

    price = close;
  }

  // Scale to anchor price if provided
  if (anchorPrice && anchorPrice > 0 && candles.length) {
    const lastClose = candles[candles.length - 1].close;
    const scale = anchorPrice / lastClose;

    for (const candle of candles) {
      candle.open *= scale;
      candle.high *= scale;
      candle.low *= scale;
      candle.close *= scale;
    }
  }

  return candles;
}

type PriceChartProps = {
  tokenPair: string; // e.g., "cUSDC/cRLC"
  currentPrice?: number | null;
};

export function PriceChart({ tokenPair, currentPrice }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<typeof CandlestickSeries> | null>(null);

  // Generate candles based on token pair (deterministic per pair)
  const candles = useMemo(
    () => generateMockCandles(tokenPair, currentPrice ?? undefined),
    [tokenPair, currentPrice]
  );

  // Initialize chart
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // iEx AI theme colors (matching existing design)
    const upColor = "#40b66b"; // text-positive
    const downColor = "#fa2b39"; // text-negative
    const textColor = "#9b9ba5"; // text-muted
    const gridColor = "rgba(255, 255, 255, 0.06)";
    const borderColor = "#2c2c31"; // border-main

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: textColor,
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      rightPriceScale: {
        borderColor: borderColor,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 0, // Normal crosshair
        vertLine: {
          color: "rgba(255, 255, 255, 0.2)",
          labelBackgroundColor: "#1e40af",
        },
        horzLine: {
          color: "rgba(255, 255, 255, 0.2)",
          labelBackgroundColor: "#1e40af",
        },
      },
    });

    chartRef.current = chart;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: upColor,
      downColor: downColor,
      borderVisible: false,
      wickUpColor: upColor,
      wickDownColor: downColor,
      priceFormat: {
        type: "price",
        precision: 6,
        minMove: 0.000001,
      },
    });

    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Update chart data when candles change
  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;

    if (!series || !chart) return;

    series.setData(candles);
    chart.timeScale().fitContent();
  }, [candles]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-[320px]"
      style={{ position: "relative" }}
    />
  );
}
