import type { Preview } from '@storybook/nextjs-vite'
import React from 'react'
import '../src/app/globals.css'
import { AuthProvider } from '../src/components/providers/auth-provider'
import { BrandsProvider } from '../src/components/providers/brands-provider'
import { ThemeProvider } from '../src/components/providers/theme-provider'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0a0a0a' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <BrandsProvider>
            <Story />
          </BrandsProvider>
        </AuthProvider>
      </ThemeProvider>
    ),
  ],
};

export default preview;

