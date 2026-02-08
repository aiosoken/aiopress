import Link from "next/link";
import { Sparkles, Dna, Image, FileText, BarChart3, ArrowRight, Zap, Layers, Printer, Presentation } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary glow-orange">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">AIOプレス</span>
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
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-[0_4px_20px_rgba(242,85,51,0.3)]"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-hero text-neutral-white overflow-hidden">
        <div className="bg-grid absolute inset-0" />
        {/* Floating Orbs */}
        <div className="orb w-[500px] h-[500px] bg-primary/20 -top-48 -right-48 animate-pulse-glow" />
        <div className="orb w-[400px] h-[400px] bg-secondary/15 -bottom-32 -left-32 animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="orb w-[200px] h-[200px] bg-primary/10 top-1/2 left-1/3 animate-float-slow" />

        <div className="relative container mx-auto px-4 pt-40 pb-28 md:pt-48 md:pb-36 text-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Google Cloud AI Hackathon Vol.4
            </div>
          </div>

          <h1 className="heading-display max-w-5xl mx-auto animate-fade-up delay-100">
            ブランドDNAから
            <br />
            <span className="text-gradient">AIクリエイティブ</span>
            を自動生成
          </h1>

          <p className="mt-8 text-lg md:text-xl text-neutral-gray-400 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-200">
            ミッション、ビジョン、トーン&マナーなどのブランドDNAをAIが理解し、
            一貫性のあるテキスト・画像クリエイティブを瞬時に生成します。
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground transition-all hover:shadow-[0_8px_30px_rgba(242,85,51,0.4)] hover:-translate-y-0.5 gap-2"
            >
              無料で始める
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-neutral-gray-600 px-10 py-4 text-lg font-medium text-neutral-white hover:bg-white/5 transition-all hover:border-neutral-gray-400"
            >
              ログインして試す
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-up delay-400">
            <div>
              <p className="text-3xl font-black text-white">6+</p>
              <p className="text-xs text-neutral-gray-400 mt-1">生成タイプ</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">AI</p>
              <p className="text-xs text-neutral-gray-400 mt-1">ブランド適合評価</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">PPTX</p>
              <p className="text-xs text-neutral-gray-400 mt-1">プレゼン自動生成</p>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features - Bento Grid */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center mb-16 animate-fade-up">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Features</p>
          <h2 className="heading-page">
            ブランドに最適化された<span className="text-gradient">AI生成</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            ブランドDNAを一度設定するだけで、すべてのクリエイティブがブランドの世界観を反映します
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {/* Large Card - Brand DNA */}
          <div className="bento-card md:col-span-2 lg:col-span-2 md:row-span-1 group animate-fade-up delay-100">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary transition-transform group-hover:scale-110">
                <Dna className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">ブランドDNA設定</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  ミッション、ビジョン、パーソナリティ、トーン&マナーを定義。
                  AIがブランドの本質を深く理解し、あらゆるクリエイティブに一貫性を保ちます。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["ミッション", "ビジョン", "パーソナリティ", "トーン&マナー", "バリュー"].map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Text Generation */}
          <div className="bento-card group animate-fade-up delay-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/10 to-blue-600/5 text-secondary transition-transform group-hover:scale-110 mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">テキスト生成</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              キャッチコピー、SNS投稿、記事をブランドDNAに基づいて複数パターン自動生成。
            </p>
          </div>

          {/* Image Generation */}
          <div className="bento-card group animate-fade-up delay-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 text-purple-600 transition-transform group-hover:scale-110 mb-4">
              <Image className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">画像生成</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Imagen 3 APIによる高品質な画像生成。ブランドカラーやスタイルを自動反映。
            </p>
          </div>

          {/* Brand Fit Score */}
          <div className="bento-card group animate-fade-up delay-400">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-600 transition-transform group-hover:scale-110 mb-4">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Brand Fit Score</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              生成クリエイティブのブランド適合度をAIが0〜100点で自動評価。
            </p>
          </div>

          {/* Presentation */}
          <div className="bento-card group animate-fade-up delay-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-600 transition-transform group-hover:scale-110 mb-4">
              <Presentation className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">PPTX自動生成</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              テーマを入力するだけでブランドDNAに沿ったプレゼン資料をPPTX形式で生成。
            </p>
          </div>

          {/* Wide Card - Asset Analysis */}
          <div className="bento-card md:col-span-2 lg:col-span-2 group animate-fade-up delay-500">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 text-cyan-600 transition-transform group-hover:scale-110">
                <Layers className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">アセット分析 & AIO最適化</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  既存の画像・文書をAIが分析しブランド特性を自動抽出。
                  AI検索（AIO）で発見されやすい構造化コンテンツを生成し、次世代のSEO対策も。
                </p>
              </div>
            </div>
          </div>

          {/* Print */}
          <div className="bento-card group animate-fade-up delay-600">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 text-rose-600 transition-transform group-hover:scale-110 mb-4">
              <Printer className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Epson印刷連携</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              生成クリエイティブをEpson Connectでそのまま印刷出力。
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t border-border/50 py-20 bg-gradient-warm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-8">Powered by</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {[
              { name: "Gemini 2.0 Flash", accent: "text-blue-600" },
              { name: "Imagen 3", accent: "text-purple-600" },
              { name: "Vision AI", accent: "text-emerald-600" },
              { name: "Cloud Functions", accent: "text-amber-600" },
              { name: "Firestore", accent: "text-orange-600" },
              { name: "Next.js 16", accent: "text-foreground" },
            ].map(({ name, accent }) => (
              <span key={name} className={`text-sm font-semibold ${accent} transition-colors`}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="heading-page mb-4">
            ブランドの世界観を、<span className="text-gradient">AIで加速</span>しませんか？
          </h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
            ブランドDNAを設定して、一貫性のあるクリエイティブを今すぐ生成しましょう。
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center justify-center rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground transition-all hover:shadow-[0_8px_30px_rgba(242,85,51,0.4)] hover:-translate-y-0.5 gap-2"
          >
            無料で始める
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="font-medium">AIOプレス</span>
          </div>
          <p>&copy; 2026 AIOプレス. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
