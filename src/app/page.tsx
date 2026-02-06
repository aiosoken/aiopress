import Link from "next/link";
import { Sparkles, Dna, Image, FileText, BarChart3, ArrowRight, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AIOプレス</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-8">
          <Zap className="h-3.5 w-3.5 text-primary" />
          Google Cloud AI Hackathon Vol.4
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
          ブランドDNAから
          <span className="text-primary">AIクリエイティブ</span>
          を自動生成
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          ミッション、ビジョン、トーン＆マナーなどのブランドDNAをAIが理解し、
          一貫性のあるテキスト・画像クリエイティブを瞬時に生成します。
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors gap-2"
          >
            無料で始める
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border px-8 py-3 text-base font-medium hover:bg-muted transition-colors"
          >
            ログインして試す
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 border-t">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          ブランドに最適化されたAI生成
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          ブランドDNAを一度設定するだけで、すべてのクリエイティブがブランドの世界観を反映します
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Dna className="h-6 w-6" />}
            title="ブランドDNA設定"
            description="ミッション、ビジョン、パーソナリティ、トーン＆マナーを定義。AIがブランドの本質を理解します。"
          />
          <FeatureCard
            icon={<FileText className="h-6 w-6" />}
            title="テキスト生成"
            description="キャッチコピー、SNS投稿、記事をブランドDNAに基づいて複数パターン自動生成。"
          />
          <FeatureCard
            icon={<Image className="h-6 w-6" />}
            title="画像生成"
            description="Imagen 3 APIによる高品質な画像生成。ブランドカラーやスタイルを自動反映。"
          />
          <FeatureCard
            icon={<BarChart3 className="h-6 w-6" />}
            title="Brand Fit Score"
            description="生成されたクリエイティブのブランド適合度をAIが0〜100点で自動評価。"
          />
          <FeatureCard
            icon={<Sparkles className="h-6 w-6" />}
            title="アセット分析"
            description="既存の画像・文書をAIが分析し、ブランド特性を自動抽出。DNA設定に反映。"
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="AIO最適化"
            description="AI検索（AIO）で発見されやすい構造化コンテンツを生成。次世代のSEO対策。"
          />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground mb-6">Powered by</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <span className="text-sm font-medium">Gemini 1.5 Pro</span>
            <span className="text-sm font-medium">Imagen 3</span>
            <span className="text-sm font-medium">Vision AI</span>
            <span className="text-sm font-medium">Cloud Functions</span>
            <span className="text-sm font-medium">Firestore</span>
            <span className="text-sm font-medium">Next.js 16</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AIOプレス</span>
          </div>
          <p>Google Cloud AI Hackathon Vol.4</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
