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

export interface TitleSlideData {
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
}

export interface SectionSlideData {
  number: string;
  title: string;
}

export interface ContentSlideData {
  title: string;
  subtitle?: string;
  body: string | RichText[];
  notes?: string;
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
}

export interface EndSlideData {
  message: string;
  organization?: string;
  url?: string;
  copyright?: string;
}

export type SlideType =
  | "title"
  | "section"
  | "content"
  | "table"
  | "chart"
  | "metrics"
  | "two-column"
  | "end";

export type SlideDefinition =
  | { type: "title"; data: TitleSlideData }
  | { type: "section"; data: SectionSlideData }
  | { type: "content"; data: ContentSlideData }
  | { type: "table"; data: TableSlideData }
  | { type: "chart"; data: ChartSlideData }
  | { type: "metrics"; data: MetricsSlideData }
  | { type: "two-column"; data: TwoColumnSlideData }
  | { type: "end"; data: EndSlideData };

export interface PresentationConfig {
  title: string;
  author?: string;
  theme?: BrandTheme;
  layout?: "16x9" | "4x3";
  slides: SlideDefinition[];
}

export interface GenerateOptions {
  outputPath?: string;
}

export interface GenerateResult {
  buffer: Buffer;
  filePath?: string;
  slideCount: number;
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
