import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DashboardContent } from '@/components/dashboard-content';

const meta: Meta<typeof DashboardContent> = {
  title: 'Components/DashboardContent',
  component: DashboardContent,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DashboardContent />,
};
