export interface BrandTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    baseSize: number;
    scale: number;
  };
  brandDNA?: {
    mission: string;
    vision: string;
    valueProposition: string;
    personality: string;
    tone: string;
  };
}

export interface RichText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  fontSize?: number;
  breakType?: "none" | "line" | "paragraph";
}

export interface ChartSeries {
  name: string;
  labels: string[];
  values: number[];
  color?: string;
}

// 画像設定インターフェース
export interface ImageConfig {
  // 画像ソース（URLまたはBase64エンコードされたデータ、またはローカルパス）
  source: string;
  // 画像の位置とサイズ
  x: number;
  y: number;
  w: number;
  h: number;
  // オプション設定
  sizing?: {
    type: "contain" | "cover" | "crop";
    w?: number;
    h?: number;
  };
  rounding?: boolean;
  transparency?: number;
  hyperlink?: string;
  altText?: string;
}

// AI画像生成設定
export interface AIImageConfig {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  numberOfImages?: number;
  guidanceScale?: number;
  seed?: number;
  // 生成後の配置設定
  placement?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

// 図形設定インターフェース
export interface ShapeConfig {
  type:
    | "rect"
    | "ellipse"
    | "roundRect"
    | "triangle"
    | "rightTriangle"
    | "diamond"
    | "pentagon"
    | "hexagon"
    | "octagon"
    | "star"
    | "plus"
    | "arc"
    | "blockArc"
    | "line"
    | "rightArrow"
    | "leftArrow"
    | "upArrow"
    | "downArrow"
    | "leftRightArrow"
    | "upDownArrow"
    | "quadArrow"
    | "leftRightUpArrow"
    | "bentArrow"
    | "uturnArrow"
    | "leftUpArrow"
    | "bentUpArrow"
    | "curvedRightArrow"
    | "curvedLeftArrow"
    | "curvedUpArrow"
    | "curvedDownArrow"
    | "stripedRightArrow"
    | "notchedRightArrow"
    | "homePlate"
    | "chevron"
    | "rightArrowCallout"
    | "downArrowCallout"
    | "leftArrowCallout"
    | "upArrowCallout"
    | "leftRightArrowCallout"
    | "quadArrowCallout"
    | "circularArrow"
    | "flowChartProcess"
    | "flowChartDecision"
    | "flowChartInputOutput"
    | "flowChartPredefinedProcess"
    | "flowChartInternalStorage"
    | "flowChartDocument"
    | "flowChartMultidocument"
    | "flowChartTerminator"
    | "flowChartPreparation"
    | "flowChartManualInput"
    | "flowChartManualOperation"
    | "flowChartConnector"
    | "flowChartPunchedCard"
    | "flowChartPunchedTape"
    | "flowChartSummingJunction"
    | "flowChartOr"
    | "flowChartCollate"
    | "flowChartSort"
    | "flowChartExtract"
    | "flowChartMerge"
    | "flowChartOfflineStorage"
    | "flowChartOnlineStorage"
    | "flowChartMagneticTape"
    | "flowChartMagneticDisk"
    | "flowChartMagneticDrum"
    | "flowChartDisplay"
    | "flowChartDelay"
    | "flowChartAlternateProcess"
    | "flowChartOffpageConnector"
    | "actionButtonBlank"
    | "actionButtonHome"
    | "actionButtonHelp"
    | "actionButtonInformation"
    | "actionButtonForwardNext"
    | "actionButtonBackPrevious"
    | "actionButtonEnd"
    | "actionButtonBeginning"
    | "actionButtonReturn"
    | "actionButtonDocument"
    | "actionButtonSound"
    | "actionButtonMovie"
    | "gear6"
    | "gear9"
    | "funnel"
    | "mathPlus"
    | "mathMinus"
    | "mathMultiply"
    | "mathDivide"
    | "mathEqual"
    | "mathNotEqual"
    | "cornerTabs"
    | "squareTabs"
    | "plaqueTabs"
    | "chartX"
    | "chartStar"
    | "chartPlus";
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: {
    color?: string;
    transparency?: number;
    type?: "solid" | "none";
  };
  line?: {
    color?: string;
    width?: number;
    dashType?: "solid" | "dash" | "dashDot" | "lgDash" | "lgDashDot" | "lgDashDotDot" | "sysDash" | "sysDot";
    beginArrowType?: "none" | "arrow" | "diamond" | "oval" | "stealth" | "triangle";
    endArrowType?: "none" | "arrow" | "diamond" | "oval" | "stealth" | "triangle";
  };
  rotate?: number;
  flipH?: boolean;
  flipV?: boolean;
}

export interface TitleSlideData {
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  backgroundImage?: ImageConfig;
}

export interface SectionSlideData {
  number: string;
  title: string;
  backgroundImage?: ImageConfig;
}

export interface ContentSlideData {
  title: string;
  subtitle?: string;
  body: string | RichText[];
  notes?: string;
  images?: ImageConfig[];
  shapes?: ShapeConfig[];
}

export interface TableSlideData {
  title: string;
  subtitle?: string;
  tables: TableConfig[];
}

export interface TableConfig {
  label?: string;
  headers: string[];
  rows: TableRow[];
  columnWidths?: number[];
}

export interface TableRow {
  cells: TableCell[];
}

export interface TableCell {
  text: string;
  color?: string;
  bold?: boolean;
}

export interface ChartSlideData {
  title: string;
  chartType: "bar" | "line" | "pie" | "doughnut";
  series: ChartSeries[];
  options?: Record<string, unknown>;
}

export interface MetricsSlideData {
  title: string;
  subtitle?: string;
  metrics: MetricCard[];
}

export interface MetricCard {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export interface TwoColumnSlideData {
  title: string;
  left: ColumnContent;
  right: ColumnContent;
}

export interface ColumnContent {
  title: string;
  body: string | RichText[];
  accentColor?: string;
  images?: ImageConfig[];
  shapes?: ShapeConfig[];
}

// 新しいスライドタイプ: 画像中心のスライド
export interface ImageSlideData {
  title?: string;
  subtitle?: string;
  images: ImageConfig[];
  caption?: string;
  layout?: "single" | "grid" | "collage";
}

// 新しいスライドタイプ: 画像とテキストのスライド
export interface ImageTextSlideData {
  title: string;
  subtitle?: string;
  image: ImageConfig;
  body: string | RichText[];
  imagePosition: "left" | "right" | "top" | "bottom";
  notes?: string;
}

// 新しいスライドタイプ: ダイアグラムスライド
export interface DiagramSlideData {
  title: string;
  subtitle?: string;
  shapes: ShapeConfig[];
  connectors?: ConnectorConfig[];
  labels?: LabelConfig[];
}

export interface ConnectorConfig {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color?: string;
  width?: number;
  dashType?: "solid" | "dash" | "dashDot";
  arrowEnd?: boolean;
  arrowBegin?: boolean;
}

export interface LabelConfig {
  text: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  align?: "left" | "center" | "right";
}

export interface EndSlideData {
  message: string;
  organization?: string;
  url?: string;
  copyright?: string;
  backgroundImage?: ImageConfig;
}

export type SlideType =
  | "title"
  | "section"
  | "content"
  | "table"
  | "chart"
  | "metrics"
  | "two-column"
  | "image"
  | "image-text"
  | "diagram"
  | "end";

export type SlideDefinition =
  | { type: "title"; data: TitleSlideData }
  | { type: "section"; data: SectionSlideData }
  | { type: "content"; data: ContentSlideData }
  | { type: "table"; data: TableSlideData }
  | { type: "chart"; data: ChartSlideData }
  | { type: "metrics"; data: MetricsSlideData }
  | { type: "two-column"; data: TwoColumnSlideData }
  | { type: "image"; data: ImageSlideData }
  | { type: "image-text"; data: ImageTextSlideData }
  | { type: "diagram"; data: DiagramSlideData }
  | { type: "end"; data: EndSlideData };

export interface PresentationConfig {
  title: string;
  author?: string;
  theme?: BrandTheme;
  layout?: "16x9" | "4x3";
  slides: SlideDefinition[];
  // AI画像生成の設定
  aiImages?: {
    [slideIndex: number]: AIImageConfig[];
  };
}

export interface GenerateOptions {
  outputPath?: string;
  // Vertex AI設定
  vertexAI?: {
    projectId: string;
    location: string;
  };
}

export interface GenerateResult {
  buffer: Buffer;
  filePath?: string;
  slideCount: number;
  generatedImages?: {
    slideIndex: number;
    imageUrl: string;
    prompt: string;
  }[];
}

export interface ResolvedTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  fontFamily: string;
  baseSize: number;
  headingSize: number;
  titleSize: number;
  lightText: string;
  darkText: string;
}
