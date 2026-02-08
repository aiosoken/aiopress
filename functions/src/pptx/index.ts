import PptxGenJS from "pptxgenjs";
import * as fs from "fs";
import * as path from "path";
import type {
  PresentationConfig,
  GenerateOptions,
  GenerateResult,
  SlideDefinition,
  ResolvedTheme,
} from "./types";
import { resolveTheme } from "./theme";
import {
  addTitleSlide,
  addSectionSlide,
  addContentSlide,
  addTableSlide,
  addChartSlide,
  addMetricsSlide,
  addTwoColumnSlide,
  addImageSlide,
  addImageTextSlide,
  addDiagramSlide,
  addEndSlide,
} from "./layouts";

export async function generatePptx(
  config: PresentationConfig,
  options?: GenerateOptions
): Promise<GenerateResult> {
  const resolvedTheme = resolveTheme(config.theme);
  const pptx = new PptxGenJS();

  if (config.title) pptx.title = config.title;
  if (config.author) pptx.author = config.author;
  pptx.layout = config.layout === "4x3" ? "LAYOUT_4x3" : "LAYOUT_16x9";

  for (const def of config.slides) {
    const slide = pptx.addSlide();
    renderSlide(pptx, slide, def, resolvedTheme);
  }

  const output = await pptx.write({ outputType: "nodebuffer" });
  const buffer = Buffer.from(output as ArrayBuffer);

  const result: GenerateResult = {
    buffer,
    slideCount: config.slides.length,
  };

  if (options?.outputPath) {
    const outputPath = path.resolve(options.outputPath);
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, buffer);
    result.filePath = outputPath;
  }

  return result;
}

function renderSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  def: SlideDefinition,
  theme: ResolvedTheme
): void {
  switch (def.type) {
    case "title":
      addTitleSlide(pptx, slide, def.data, theme);
      break;
    case "section":
      addSectionSlide(pptx, slide, def.data, theme);
      break;
    case "content":
      addContentSlide(pptx, slide, def.data, theme);
      break;
    case "table":
      addTableSlide(pptx, slide, def.data, theme);
      break;
    case "chart":
      addChartSlide(pptx, slide, def.data, theme);
      break;
    case "metrics":
      addMetricsSlide(pptx, slide, def.data, theme);
      break;
    case "two-column":
      addTwoColumnSlide(pptx, slide, def.data, theme);
      break;
    case "image":
      addImageSlide(pptx, slide, def.data, theme);
      break;
    case "image-text":
      addImageTextSlide(pptx, slide, def.data, theme);
      break;
    case "diagram":
      addDiagramSlide(pptx, slide, def.data, theme);
      break;
    case "end":
      addEndSlide(pptx, slide, def.data, theme);
      break;
  }
}

export type { PresentationConfig, GenerateOptions, GenerateResult } from "./types";
