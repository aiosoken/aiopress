import type PptxGenJS from "pptxgenjs";
import type { MetricsSlideData, MetricCard, ResolvedTheme } from "../types";
import { lighten, contrastText } from "../utils/color";

export function addMetricsSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: MetricsSlideData,
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

  let cardsY = 1.5;
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 0.6,
      y: cardsY,
      w: 8.8,
      h: 0.4,
      fontSize: theme.baseSize,
      fontFace: theme.fontFamily,
      color: theme.accent,
      bold: true,
    });
    cardsY += 0.55;
  }

  const metrics = data.metrics;
  const cols = metrics.length <= 3 ? metrics.length : Math.min(4, metrics.length);
  const rows = Math.ceil(metrics.length / cols);

  const totalW = 8.8;
  const gap = 0.25;
  const cardW = (totalW - gap * (cols - 1)) / cols;
  const availableH = 7.5 - cardsY - 0.3;
  const cardH = Math.min(2.2, (availableH - gap * (rows - 1)) / rows);

  metrics.forEach((metric, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.6 + col * (cardW + gap);
    const y = cardsY + row * (cardH + gap);
    renderMetricCard(pptx, slide, metric, x, y, cardW, cardH, theme);
  });
}

function renderMetricCard(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  metric: MetricCard,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: ResolvedTheme
): void {
  const cardBg = lighten(theme.primary, 0.92);
  const textOnCard = contrastText(cardBg);

  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w,
    h,
    fill: { color: cardBg },
    rectRadius: 0.08,
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.05,
    y,
    w: w - 0.1,
    h: 0.04,
    fill: { color: theme.accent },
  });

  slide.addText(metric.label, {
    x,
    y: y + 0.2,
    w,
    h: 0.4,
    fontSize: theme.baseSize - 2,
    fontFace: theme.fontFamily,
    color: textOnCard,
    align: "center",
    valign: "middle",
  });

  slide.addText(metric.value, {
    x,
    y: y + 0.55,
    w,
    h: 0.8,
    fontSize: theme.titleSize + 2,
    fontFace: theme.fontFamily,
    color: theme.primary,
    bold: true,
    align: "center",
    valign: "middle",
  });

  if (metric.change) {
    const changeColor =
      metric.changeType === "positive"
        ? "008800"
        : metric.changeType === "negative"
          ? "CC0000"
          : theme.text;

    slide.addText(metric.change, {
      x,
      y: y + h - 0.5,
      w,
      h: 0.35,
      fontSize: theme.baseSize - 2,
      fontFace: theme.fontFamily,
      color: changeColor,
      bold: true,
      align: "center",
      valign: "middle",
    });
  }
}
