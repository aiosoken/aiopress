"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Dna,
  Sparkles,
  Settings,
  Building2,
  Plus,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthContext, useBrandsContext } from "@/components/providers";

const menuItems = [
  { icon: LayoutDashboard, label: "ダッシュボード", href: "/dashboard" },
  { icon: Building2, label: "ブランド", href: "/brands" },
  { icon: FolderOpen, label: "資産", href: "/assets" },
  { icon: Dna, label: "ブランドDNA", href: "/design-system" },
  { icon: Sparkles, label: "クリエイティブ生成", href: "/creatives" },
  { icon: BarChart3, label: "分析・レポート", href: "/analytics" },
  { icon: Settings, label: "設定", href: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { firebaseUser } = useAuthContext();
  const { brands, selectedBrandId, selectBrand, loading: brandsLoading } = useBrandsContext();

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getBrandInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const selectedBrand = brands.find((b) => b.id === selectedBrandId) || null;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">
              AIOプレス
            </h1>
            <p className="text-xs text-sidebar-foreground/50">
              AI-Optimized Press
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/40 px-4 py-2">
            ブランド選択
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            {brandsLoading ? (
              <div className="flex items-center justify-center py-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : selectedBrand ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-sidebar-accent transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs font-medium">
                        {getBrandInitials(selectedBrand.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-left text-sm font-medium text-sidebar-foreground truncate">
                      {selectedBrand.name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-sidebar-foreground/40" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {brands.map((brand) => (
                    <DropdownMenuItem
                      key={brand.id}
                      className={`gap-3 ${brand.id === selectedBrandId ? "bg-accent" : ""}`}
                      onClick={() => selectBrand(brand.id)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-muted text-foreground text-xs">
                          {getBrandInitials(brand.name)}
                        </AvatarFallback>
                      </Avatar>
                      {brand.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem className="gap-3 text-primary" asChild>
                    <Link href="/brands/new">
                      <Plus className="h-4 w-4" />
                      新しいブランドを作成
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/brands/new"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-sidebar-accent transition-colors text-primary"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">ブランドを作成</span>
              </Link>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/40 px-4 py-2">
            メニュー
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`gap-3 ${isActive ? "border-l-2 border-sidebar-primary" : ""}`}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={firebaseUser?.photoURL || undefined} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm font-medium">
              {getInitials(firebaseUser?.displayName ?? null)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {firebaseUser?.displayName || "ユーザー"}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">
              {firebaseUser?.email || ""}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
