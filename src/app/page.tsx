import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Brain, Palette, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>AIOプレス</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">ログイン</Link>
            </Button>
            <Button asChild>
              <Link href="/register">新規登録</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  AIが創る、
                  <br />
                  <span className="text-primary">ブランドの未来</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  企業のブランド資産を一元管理し、Google Cloud
                  AIを活用して一貫性のあるブランドコミュニケーションを自動生成。
                  AI時代のブランド戦略を、AIOプレスが実現します。
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/register">
                    無料で始める
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">機能を見る</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                主要機能
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                AIOプレスが提供する、AIドリブンなブランド管理機能
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Brain className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>ブランド資産の自動分析</CardTitle>
                  <CardDescription>
                    Vision AI と Gemini
                    APIが、アップロードされた資産を自動で分析・分類
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    画像、PDF、テキストなど様々な形式の資産から、ブランドの特徴を自動抽出。キーワード、トーン、カラーパレットを学習します。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Palette className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>デザインシステム管理</CardTitle>
                  <CardDescription>
                    ブランドの一貫性を保つためのデザインシステムを構築
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    カラーパレット、タイポグラフィ、トーン＆マナーを一元管理。AIが生成するコンテンツは常にブランドガイドラインに準拠します。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>AIクリエイティブ生成</CardTitle>
                  <CardDescription>
                    ブランドに最適化されたコンテンツを瞬時に生成
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    キャッチコピー、SNS投稿、記事、画像など、様々なクリエイティブをAIが自動生成。ブランドの声を維持しながら効率的に制作できます。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                解決する課題
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">23%</div>
                <p className="text-muted-foreground">
                  ブランド不統一による収益機会の損失
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">70%+</div>
                <p className="text-muted-foreground">
                  AI経由での商品発見率
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  無限大
                </div>
                <p className="text-muted-foreground">
                  活用されていない過去の資産価値
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              今すぐ始めましょう
            </h2>
            <p className="mx-auto max-w-[600px] mb-8 opacity-90">
              AIOプレスで、AI時代のブランド戦略を実現。
              無料でアカウントを作成して、ブランドの可能性を広げましょう。
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                無料アカウント作成
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">AIOプレス</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by Google Cloud AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
