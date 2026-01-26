import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/components/providers/auth-provider';

const meta: Meta<typeof AppSidebar> = {
  title: 'Components/AppSidebar',
  component: AppSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AuthProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-background">
            <Story />
          </div>
        </SidebarProvider>
      </AuthProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <AppSidebar />,
};
