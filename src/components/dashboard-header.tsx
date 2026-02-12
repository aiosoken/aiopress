"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthContext } from "@/components/providers";

const pageLabels: Record<string, string> = {
  "/dashboard": "ダッシュボード",
  "/brands": "ブランド",
  "/brands/new": "新規作成",
  "/assets": "資産",
  "/design-system": "ブランドDNA",
  "/creatives": "クリエイティブ生成",
  "/analytics": "分析・レポート",
  "/settings": "設定",
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = pageLabels[currentPath];
    if (label) {
      crumbs.push({ label, href: currentPath });
    }
  }

  return crumbs;
}

export function DashboardHeader() {
  const { toggleSidebar } = useSidebar();
  const { firebaseUser, logout } = useAuthContext();
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-lg px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">メニューを開く</span>
      </Button>

      {/* Breadcrumb */}
      <nav className="hidden md:flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-lg"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={firebaseUser?.photoURL || undefined}
                  alt={firebaseUser?.displayName || "User"}
                />
                <AvatarFallback className="bg-muted text-sm font-medium">
                  {getInitials(firebaseUser?.displayName ?? null)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {firebaseUser?.displayName || "ユーザー"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {firebaseUser?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                設定
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
