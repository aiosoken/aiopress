import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DashboardContent } from '@/components/dashboard-content';
import { AuthProvider } from '@/components/providers/auth-provider';

const meta: Meta<typeof DashboardContent> = {
  title: 'Components/DashboardContent',
  component: DashboardContent,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Story />
        </div>
      </AuthProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DashboardContent />,
};
