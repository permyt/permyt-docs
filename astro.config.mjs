// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.permyt.io',
  integrations: [
    starlight({
      title: 'Permyt',
      description:
        'Permyt is the authorization layer between services, agents, and the data they need.',
      favicon: '/favicon.svg',
      components: {
        // Full Permyt lockup (shield mark + wordmark) in the header.
        SiteTitle: './src/components/SiteTitle.astro',
        // Splash hero with the lockup in place of the title, no side image.
        Hero: './src/components/Hero.astro',
      },
      customCss: [
        '@fontsource/space-grotesk/300.css',
        '@fontsource/space-grotesk/400.css',
        '@fontsource/space-grotesk/500.css',
        '@fontsource/space-grotesk/600.css',
        '@fontsource/space-grotesk/700.css',
        '@fontsource/jetbrains-mono/400.css',
        '@fontsource/jetbrains-mono/500.css',
        './src/styles/custom.css',
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/permyt',
        },
      ],
      sidebar: [
        {
          label: 'Introduction',
          items: [
            { label: 'What Permyt is', slug: 'index' },
            { label: 'How it works', slug: 'concepts/how-it-works' },
            { label: 'The three roles', slug: 'concepts/roles' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'Scopes and intent-driven scoping', slug: 'concepts/scopes' },
            { label: 'Consent, grants, and revocation', slug: 'concepts/consent' },
            { label: 'Force inputs', slug: 'concepts/force-inputs' },
            { label: 'The zero-knowledge broker', slug: 'concepts/security' },
          ],
        },
        {
          label: 'Build with Permyt',
          items: [
            { label: 'Where your service fits', slug: 'build/overview' },
            { label: 'Quickstart', slug: 'build/quickstart' },
            { label: 'Build a Requester', slug: 'build/requester' },
            { label: 'Build a Provider', slug: 'build/provider' },
            { label: 'Connect users', slug: 'build/connect' },
          ],
        },
        {
          label: 'Protocol reference',
          items: [
            { label: 'Protocol overview', slug: 'protocol/overview' },
            { label: 'Protocol cycles', slug: 'protocol/cycles' },
            { label: 'Broker API and data shapes', slug: 'protocol/api' },
          ],
        },
        {
          label: 'Patterns',
          items: [
            { label: 'Provider patterns', slug: 'patterns/provider-patterns' },
            { label: 'Connectors', slug: 'patterns/connectors' },
            { label: 'AI agents as requesters', slug: 'patterns/ai-agents' },
          ],
        },
        {
          label: 'The Permyt app',
          items: [{ label: 'The Permyt app', slug: 'app/permyt-app' }],
        },
      ],
    }),
  ],
});
