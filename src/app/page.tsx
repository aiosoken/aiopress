import Link from "next/link";
import { Dna, Image, FileText, BarChart3, ArrowRight, Layers, Printer, Presentation } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">AIOプレス</span>
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
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-primary mb-8">
            Google Cloud AI Hackathon Vol.4
          </div>

          <h1 className="heading-display max-w-4xl mx-auto text-foreground">
            ブランドDNAから
            <br />
            <span className="text-primary">AIクリエイティブ</span>
            を自動生成
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ミッション、ビジョン、トーン&マナーなどのブランドDNAをAIが理解し、
            一貫性のあるテキスト・画像クリエイティブを瞬時に生成します。
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors gap-2"
            >
              無料で始める
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors"
            >
              ログインして試す
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div>
              <p className="text-2xl font-bold text-foreground">6+</p>
              <p className="text-xs text-muted-foreground mt-1">生成タイプ</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">AI</p>
              <p className="text-xs text-muted-foreground mt-1">ブランド適合評価</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">PPTX</p>
              <p className="text-xs text-muted-foreground mt-1">プレゼン自動生成</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-neutral-gray-100 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Features</p>
            <h2 className="heading-page text-foreground">
              ブランドに最適化された<span className="text-primary">AI生成</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
              ブランドDNAを一度設定するだけで、すべてのクリエイティブがブランドの世界観を反映します
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {/* Brand DNA */}
            <div className="feature-card md:col-span-2">
              <div className="flex flex-col md:flex-row gap-5 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Dna className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1.5">ブランドDNA設定</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    ミッション、ビジョン、パーソナリティ、トーン&マナーを定義。
                    AIがブランドの本質を深く理解し、あらゆるクリエイティブに一貫性を保ちます。
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["ミッション", "ビジョン", "パーソナリティ", "トーン&マナー", "バリュー"].map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Text Generation */}
            <div className="feature-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1.5">テキスト生成</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                キャッチコピー、SNS投稿、記事をブランドDNAに基づいて複数パターン自動生成。
              </p>
            </div>

            {/* Image Generation */}
            <div className="feature-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/10 text-purple-600 mb-3">
                <Image className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1.5">画像生成</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Imagen 3 APIによる高品質な画像生成。ブランドカラーやスタイルを自動反映。
              </p>
            </div>

            {/* Brand Fit Score */}
            <div className="feature-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600 mb-3">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1.5">Brand Fit Score</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                生成クリエイティブのブランド適合度をAIが0〜100点で自動評価。
              </p>
            </div>

            {/* Presentation */}
            <div className="feature-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600/10 text-amber-600 mb-3">
                <Presentation className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1.5">PPTX自動生成</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                テーマを入力するだけでブランドDNAに沿ったプレゼン資料をPPTX形式で生成。
              </p>
            </div>

            {/* Asset Analysis */}
            <div className="feature-card md:col-span-2">
              <div className="flex flex-col md:flex-row gap-5 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cyan-600/10 text-cyan-600">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1.5">アセット分析 & AIO最適化</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    既存の画像・文書をAIが分析しブランド特性を自動抽出。
                    AI検索（AIO）で発見されやすい構造化コンテンツを生成し、次世代のSEO対策も。
                  </p>
                </div>
              </div>
            </div>

            {/* Print */}
            <div className="feature-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/10 text-red-600 mb-3">
                <Printer className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1.5">Epson印刷連携</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                生成クリエイティブをEpson Connectでそのまま印刷出力。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t border-border py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">Powered by</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {[
              "Gemini 2.0 Flash",
              "Imagen 3",
              "Vision AI",
              "Cloud Functions",
              "Firestore",
              "Next.js 16",
            ].map((name) => (
              <span key={name} className="text-sm font-medium text-muted-foreground">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-neutral-gray-100 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h2 className="heading-page mb-3 text-foreground">
            ブランドの世界観を、<span className="text-primary">AIで加速</span>しませんか？
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm">
            ブランドDNAを設定して、一貫性のあるクリエイティブを今すぐ生成しましょう。
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors gap-2"
          >
            無料で始める
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <span className="text-[10px] font-bold text-white">A</span>
            </div>
            <span className="font-medium text-foreground">AIOプレス</span>
          </div>
          <p>&copy; 2026 AIOプレス. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
