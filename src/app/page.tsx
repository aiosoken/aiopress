import Link from "next/link";
import { Sparkles, Dna, Image, FileText, BarChart3, ArrowRight, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
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
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-neutral-black text-neutral-white">
        <div className="container mx-auto px-4 py-24 md:py-36 text-center">
          <h1 className="heading-display max-w-4xl mx-auto">
            ブランドDNAから
            <span className="text-primary">AIクリエイティブ</span>
            を自動生成
          </h1>
          <p className="mt-6 text-lg md:text-xl text-neutral-gray-400 max-w-2xl mx-auto leading-relaxed">
            ミッション、ビジョン、トーン＆マナーなどのブランドDNAをAIが理解し、
            一貫性のあるテキスト・画像クリエイティブを瞬時に生成します。
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground hover:bg-primary/90 transition-colors gap-2"
            >
              無料で始める
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-neutral-gray-600 px-10 py-4 text-lg font-medium text-neutral-white hover:bg-neutral-gray-800 transition-colors"
            >
              ログインして試す
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="heading-page text-center mb-4">
          ブランドに最適化されたAI生成
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          ブランドDNAを一度設定するだけで、すべてのクリエイティブがブランドの世界観を反映します
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Dna className="h-8 w-8" />}
            title="ブランドDNA設定"
            description="ミッション、ビジョン、パーソナリティ、トーン＆マナーを定義。AIがブランドの本質を理解します。"
          />
          <FeatureCard
            icon={<FileText className="h-8 w-8" />}
            title="テキスト生成"
            description="キャッチコピー、SNS投稿、記事をブランドDNAに基づいて複数パターン自動生成。"
          />
          <FeatureCard
            icon={<Image className="h-8 w-8" />}
            title="画像生成"
            description="Imagen 3 APIによる高品質な画像生成。ブランドカラーやスタイルを自動反映。"
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Brand Fit Score"
            description="生成されたクリエイティブのブランド適合度をAIが0〜100点で自動評価。"
          />
          <FeatureCard
            icon={<Sparkles className="h-8 w-8" />}
            title="アセット分析"
            description="既存の画像・文書をAIが分析し、ブランド特性を自動抽出。DNA設定に反映。"
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8" />}
            title="AIO最適化"
            description="AI検索（AIO）で発見されやすい構造化コンテンツを生成。次世代のSEO対策。"
          />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t border-border/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground mb-6">Powered by</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <span className="text-sm font-medium">Gemini 2.0 Flash</span>
            <span className="text-sm font-medium">Imagen 3</span>
            <span className="text-sm font-medium">Vision AI</span>
            <span className="text-sm font-medium">Cloud Functions</span>
            <span className="text-sm font-medium">Firestore</span>
            <span className="text-sm font-medium">Next.js 16</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AIOプレス</span>
          </div>
          <p>&copy; 2026 AIOプレス. All rights reserved.</p>
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
    <div className="p-6 card-interactive rounded-lg">
      <div className="text-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
