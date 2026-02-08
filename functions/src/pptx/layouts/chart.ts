import type PptxGenJS from "pptxgenjs";
import type { ChartSlideData, ResolvedTheme } from "../types";
import { lighten } from "../utils/color";

const CHART_TYPE_MAP = {
  bar: "bar",
  line: "line",
  pie: "pie",
  doughnut: "doughnut",
} as const;

export function addChartSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: ChartSlideData,
  theme: ResolvedTheme
): void {
  slide.background = { color: theme.background };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 1.1,
    fill: { color: theme.primary },
  });

  slide.addText(data.title, {
    x: 0.6,
    y: 0.15,
    w: 8.8,
    h: 0.8,
    fontSize: theme.headingSize,
    fontFace: theme.fontFamily,
    color: theme.lightText,
    bold: true,
    align: "left",
    valign: "middle",
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 1.1,
    w: "100%",
    h: 0.04,
    fill: { color: theme.accent },
  });

  const chartColors = generateChartColors(theme, data.series.length);

  const chartTypeName = CHART_TYPE_MAP[data.chartType];
  const chartType = pptx.ChartType[chartTypeName];

  const chartData = data.series.map((s, i) => ({
    name: s.name,
    labels: s.labels,
    values: s.values,
    color: s.color ?? chartColors[i % chartColors.length],
  }));

  const isPie = data.chartType === "pie" || data.chartType === "doughnut";

  slide.addChart(chartType, chartData, {
    x: 0.8,
    y: 1.4,
    w: 8.4,
    h: 5.5,
    showLegend: true,
    legendPos: isPie ? "b" : "r",
    legendFontSize: theme.baseSize - 3,
    showValue: !isPie,
    showPercent: isPie,
    chartColors,
    catAxisLabelFontSize: theme.baseSize - 3,
    valAxisLabelFontSize: theme.baseSize - 3,
    valGridLine: { style: "solid", color: lighten(theme.text, 0.8) },
    ...((data.options ?? {}) as Record<string, unknown>),
  });
}

function generateChartColors(theme: ResolvedTheme, count: number): string[] {
  const base = [
    theme.primary,
    theme.accent,
    theme.secondary,
    lighten(theme.primary, 0.3),
    lighten(theme.accent, 0.3),
    lighten(theme.secondary, 0.3),
    lighten(theme.primary, 0.5),
    lighten(theme.accent, 0.5),
  ];
  while (base.length < count) {
    base.push(lighten(theme.primary, 0.1 * base.length));
  }
  return base.slice(0, Math.max(count, 3));
}
