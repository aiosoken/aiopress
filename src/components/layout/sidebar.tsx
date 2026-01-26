"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  FolderOpen,
  Wand2,
  Settings,
  Palette,
} from "lucide-react";

const navigation = [
  {
    name: "ダッシュボード",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "ブランド",
    href: "/brands",
    icon: Building2,
  },
  {
    name: "資産",
    href: "/assets",
    icon: FolderOpen,
  },
  {
    name: "デザインシステム",
    href: "/design-system",
    icon: Palette,
  },
  {
    name: "クリエイティブ生成",
    href: "/creatives",
    icon: Wand2,
  },
  {
    name: "設定",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-14 lg:border-r bg-sidebar">
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
