import type { Meta, StoryObj } from '@storybook/nextjs-vite';
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
} from '@/components/ui/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { LayoutDashboard, Building2, FolderOpen, Palette, Sparkles, Settings } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div className="min-h-screen bg-background">
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const menuItems = [
  { icon: LayoutDashboard, label: 'ダッシュボード', href: '#' },
  { icon: Building2, label: 'ブランド', href: '#' },
  { icon: FolderOpen, label: '資産', href: '#' },
  { icon: Palette, label: 'デザインシステム', href: '#' },
  { icon: Sparkles, label: 'クリエイティブ生成', href: '#' },
  { icon: Settings, label: '設定', href: '#' },
];

export const Default: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">
              AIOプレス
            </h1>
            <p className="text-xs text-muted-foreground">
              AI-Optimized Press
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4 py-2">
            メニュー
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.label === 'ダッシュボード'}
                    className="gap-3"
                  >
                    <a href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              山田
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              山田 太郎
            </p>
            <p className="text-xs text-muted-foreground truncate">
              yamada@example.com
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  ),
};
