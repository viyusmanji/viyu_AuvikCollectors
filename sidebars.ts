import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/overview',
        'getting-started/prerequisites',
      ],
    },
    {
      type: 'category',
      label: 'Hardware',
      items: [
        'hardware/bill-of-materials',
        'hardware/poe-compatibility',
        'hardware/optional-upgrades',
      ],
    },
    {
      type: 'category',
      label: 'Software',
      items: [
        'software/operating-system',
        'software/auvik-installation',
        'software/system-requirements',
      ],
    },
    {
      type: 'category',
      label: 'Network',
      items: [
        'network/ip-addressing',
        'network/vlan-placement',
        'network/firewall-rules',
        'network/snmp-configuration',
        'network/complex-scenarios',
      ],
    },
    {
      type: 'category',
      label: 'Remote Access',
      items: [
        'remote-access/tailscale-setup',
        'remote-access/ssh-jump-host',
        'remote-access/auvik-alerts',
      ],
    },
    {
      type: 'category',
      label: 'Golden Image',
      items: [
        'golden-image/image-contents',
        'golden-image/per-client-customization',
        'golden-image/cloning-process',
        'golden-image/version-history',
      ],
    },
    {
      type: 'category',
      label: 'Multi-Site Deployment',
      items: [
        'multi-site/overview',
        'multi-site/bulk-preparation',
        'multi-site/naming-conventions',
        'multi-site/fleet-management',
        'multi-site/batch-customization',
        'multi-site/alert-configuration',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      collapsed: false,
      items: [
        'deployment/pre-deployment',
        'deployment/on-site',
        'deployment/post-deployment',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'troubleshooting/common-issues',
        'troubleshooting/pi-not-powering',
        'troubleshooting/collector-offline',
        'troubleshooting/sd-card-failure',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/cost-analysis',
        'reference/auvik-documentation',
        'reference/glossary',
      ],
    },
    {
      type: 'category',
      label: 'Checklists',
      collapsed: false,
      items: [
        'checklists/complete-deployment',
        'checklists/quick-reference',
      ],
    },
  ],
};

export default sidebars;
