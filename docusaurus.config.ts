import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Auvik Collector Deployment Guide',
  tagline: 'Raspberry Pi 5 Deployment Playbook for viyu.net',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // GitHub Pages deployment
  url: 'https://viyu-net.github.io',
  baseUrl: '/viyu_AuvikCollectors/',
  organizationName: 'viyu-net',
  projectName: 'viyu_AuvikCollectors',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/viyu-net/viyu_AuvikCollectors/edit/main/',
          routeBasePath: 'docs',
        },
        blog: false, // Disable blog
        theme: {
          customCss: [
            './src/css/custom.css',
            './src/css/print.css',
          ],
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        docsRouteBasePath: '/docs',
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',

    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    navbar: {
      title: 'Auvik Collector Guide',
      logo: {
        alt: 'viyu.net Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/docs/checklists/complete-deployment',
          label: 'Checklists',
          position: 'left',
        },
        {
          to: '/docs/troubleshooting/common-issues',
          label: 'Troubleshooting',
          position: 'left',
        },
        {
          to: '/analytics',
          label: 'Analytics',
          position: 'left',
        },
        {
          href: 'https://github.com/viyu-net/viyu_AuvikCollectors',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/',
            },
            {
              label: 'Hardware',
              to: '/docs/hardware/bill-of-materials',
            },
            {
              label: 'Deployment',
              to: '/docs/deployment/pre-deployment',
            },
          ],
        },
        {
          title: 'Quick Links',
          items: [
            {
              label: 'Complete Checklist',
              to: '/docs/checklists/complete-deployment',
            },
            {
              label: 'Troubleshooting',
              to: '/docs/troubleshooting/common-issues',
            },
            {
              label: 'Cost Analysis',
              to: '/docs/reference/cost-analysis',
            },
          ],
        },
        {
          title: 'External Resources',
          items: [
            {
              label: 'Auvik Support',
              href: 'https://support.auvik.com',
            },
            {
              label: 'Raspberry Pi',
              href: 'https://www.raspberrypi.com',
            },
            {
              label: 'Tailscale',
              href: 'https://tailscale.com',
            },
          ],
        },
      ],
      copyright: `viyu.net Deployment Guide | Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml'],
    },

    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
