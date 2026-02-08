import type PptxGenJS from "pptxgenjs";
import type { ShapeConfig, ConnectorConfig } from "../types";

/**
 * スライドに図形を追加
 */
export function addShapeToSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  shapeConfig: ShapeConfig
): void {
  const shapeOptions: PptxGenJS.ShapeProps = {
    x: shapeConfig.x,
    y: shapeConfig.y,
    w: shapeConfig.w,
    h: shapeConfig.h,
  };

  // 塗りつぶし設定
  if (shapeConfig.fill) {
    const fillOptions: any = {};
    if (shapeConfig.fill.color) {
      fillOptions.color = shapeConfig.fill.color;
    }
    if (shapeConfig.fill.transparency !== undefined) {
      fillOptions.transparency = shapeConfig.fill.transparency;
    }
    if (shapeConfig.fill.type) {
      fillOptions.type = shapeConfig.fill.type;
    }
    shapeOptions.fill = fillOptions;
  }

  // 線の設定
  if (shapeConfig.line) {
    shapeOptions.line = {
      color: shapeConfig.line.color,
      width: shapeConfig.line.width,
      dashType: shapeConfig.line.dashType,
      beginArrowType: shapeConfig.line.beginArrowType,
      endArrowType: shapeConfig.line.endArrowType,
    };
  }

  // 回転
  if (shapeConfig.rotate !== undefined) {
    shapeOptions.rotate = shapeConfig.rotate;
  }

  // 反転
  if (shapeConfig.flipH) {
    shapeOptions.flipH = true;
  }
  if (shapeConfig.flipV) {
    shapeOptions.flipV = true;
  }

  // 図形を追加
  slide.addShape(pptx.ShapeType[shapeConfig.type as keyof typeof pptx.ShapeType], shapeOptions);
}

/**
 * 複数の図形をスライドに追加
 */
export function addShapesToSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  shapes: ShapeConfig[]
): void {
  shapes.forEach((shape) => addShapeToSlide(pptx, slide, shape));
}

/**
 * コネクタ（接続線）を追加
 */
export function addConnectorToSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  connector: ConnectorConfig
): void {
  const lineOptions: PptxGenJS.ShapeProps = {
    x: connector.from.x,
    y: connector.from.y,
    w: connector.to.x - connector.from.x,
    h: connector.to.y - connector.from.y,
    line: {
      color: connector.color || "000000",
      width: connector.width || 1,
      dashType: connector.dashType || "solid",
      beginArrowType: connector.arrowBegin ? "arrow" : "none",
      endArrowType: connector.arrowEnd ? "arrow" : "none",
    },
  };

  slide.addShape(pptx.ShapeType.line, lineOptions);
}

/**
 * プロセスフローを作成（フローチャート用のヘルパー）
 */
export function createProcessFlow(
  steps: Array<{ label: string; x: number; y: number }>,
  options?: {
    shapeWidth?: number;
    shapeHeight?: number;
    shapeColor?: string;
    connectorColor?: string;
    fontSize?: number;
  }
): { shapes: ShapeConfig[]; connectors: ConnectorConfig[] } {
  const shapeWidth = options?.shapeWidth || 2;
  const shapeHeight = options?.shapeHeight || 1;
  const shapeColor = options?.shapeColor || "4472C4";
  const connectorColor = options?.connectorColor || "000000";

  const shapes: ShapeConfig[] = steps.map((step) => ({
    type: "flowChartProcess",
    x: step.x,
    y: step.y,
    w: shapeWidth,
    h: shapeHeight,
    fill: {
      color: shapeColor,
      type: "solid",
    },
    line: {
      color: "FFFFFF",
      width: 2,
    },
  }));

  const connectors: ConnectorConfig[] = [];
  for (let i = 0; i < steps.length - 1; i++) {
    connectors.push({
      from: {
        x: steps[i].x + shapeWidth,
        y: steps[i].y + shapeHeight / 2,
      },
      to: {
        x: steps[i + 1].x,
        y: steps[i + 1].y + shapeHeight / 2,
      },
      color: connectorColor,
      width: 2,
      arrowEnd: true,
    });
  }

  return { shapes, connectors };
}

/**
 * 円形配置で図形を配置
 */
export function arrangeShapesInCircle(
  count: number,
  centerX: number,
  centerY: number,
  radius: number,
  shapeSize: number,
  shapeType: ShapeConfig["type"] = "ellipse",
  fillColor: string = "4472C4"
): ShapeConfig[] {
  const shapes: ShapeConfig[] = [];
  const angleStep = (2 * Math.PI) / count;

  for (let i = 0; i < count; i++) {
    const angle = i * angleStep - Math.PI / 2; // 上から始める
    const x = centerX + radius * Math.cos(angle) - shapeSize / 2;
    const y = centerY + radius * Math.sin(angle) - shapeSize / 2;

    shapes.push({
      type: shapeType,
      x,
      y,
      w: shapeSize,
      h: shapeSize,
      fill: {
        color: fillColor,
        type: "solid",
      },
    });
  }

  return shapes;
}

/**
 * 矢印付きコネクタを作成（始点から終点へ）
 */
export function createArrowConnector(
  from: { x: number; y: number },
  to: { x: number; y: number },
  options?: {
    color?: string;
    width?: number;
    dashType?: "solid" | "dash" | "dashDot";
    bidirectional?: boolean;
  }
): ConnectorConfig {
  return {
    from,
    to,
    color: options?.color || "000000",
    width: options?.width || 2,
    dashType: options?.dashType || "solid",
    arrowEnd: true,
    arrowBegin: options?.bidirectional || false,
  };
}
