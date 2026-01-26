import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DashboardHeader } from '@/components/dashboard-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/components/providers/auth-provider';

const meta: Meta<typeof DashboardHeader> = {
  title: 'Components/DashboardHeader',
  component: DashboardHeader,
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
  render: () => <DashboardHeader />,
};
