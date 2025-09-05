import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: { name: '@storybook/nextjs', options: {} },
  staticDirs: ['../public'],
  // This project never sends anything off the machine.
  core: { disableTelemetry: true },
}

export default config
