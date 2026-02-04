/**
 * Page Suggestions Data
 * Maps documentation pages to contextually relevant "You might also need" suggestions
 */

export interface PageSuggestion {
  label: string;
  href: string;
  description: string;
}

export interface PageSuggestionsMap {
  [pagePath: string]: PageSuggestion[];
}

/**
 * Maps page paths to suggested pages that users might also need
 * Each page can have 3-5 contextually relevant suggestions
 */
export const PAGE_SUGGESTIONS: PageSuggestionsMap = {
  // Getting Started
  '/docs/getting-started/overview': [
    {
      label: 'Prerequisites',
      href: '/docs/getting-started/prerequisites',
      description: 'Check what you need before starting',
    },
    {
      label: 'Bill of Materials',
      href: '/docs/hardware/bill-of-materials',
      description: 'Hardware components list',
    },
    {
      label: 'Pre-Deployment Checklist',
      href: '/docs/deployment/pre-deployment',
      description: 'Prepare for deployment',
    },
  ],
  '/docs/getting-started/prerequisites': [
    {
      label: 'Bill of Materials',
      href: '/docs/hardware/bill-of-materials',
      description: 'Order the required hardware',
    },
    {
      label: 'Operating System',
      href: '/docs/software/operating-system',
      description: 'OS setup and configuration',
    },
    {
      label: 'Complete Deployment Checklist',
      href: '/docs/checklists/complete-deployment',
      description: 'Full deployment workflow',
    },
  ],

  // Hardware
  '/docs/hardware/bill-of-materials': [
    {
      label: 'PoE Compatibility',
      href: '/docs/hardware/poe-compatibility',
      description: 'Verify PoE switch requirements',
    },
    {
      label: 'Operating System',
      href: '/docs/software/operating-system',
      description: 'Next: Install the OS',
    },
    {
      label: 'Cost Analysis',
      href: '/docs/reference/cost-analysis',
      description: 'Budget planning reference',
    },
  ],
  '/docs/hardware/poe-compatibility': [
    {
      label: 'Bill of Materials',
      href: '/docs/hardware/bill-of-materials',
      description: 'Required hardware list',
    },
    {
      label: 'Network Configuration',
      href: '/docs/network/ip-addressing',
      description: 'Network setup for PoE',
    },
    {
      label: 'Troubleshooting: Pi Not Powering',
      href: '/docs/troubleshooting/pi-not-powering',
      description: 'Common PoE power issues',
    },
  ],
  '/docs/hardware/optional-upgrades': [
    {
      label: 'Bill of Materials',
      href: '/docs/hardware/bill-of-materials',
      description: 'Standard hardware requirements',
    },
    {
      label: 'Cost Analysis',
      href: '/docs/reference/cost-analysis',
      description: 'Compare upgrade costs',
    },
    {
      label: 'System Requirements',
      href: '/docs/software/system-requirements',
      description: 'Software compatibility',
    },
  ],

  // Software
  '/docs/software/operating-system': [
    {
      label: 'Auvik Installation',
      href: '/docs/software/auvik-installation',
      description: 'Next: Install Auvik collector',
    },
    {
      label: 'System Requirements',
      href: '/docs/software/system-requirements',
      description: 'Verify compatibility',
    },
    {
      label: 'Golden Image Contents',
      href: '/docs/golden-image/image-contents',
      description: 'Pre-configured image option',
    },
  ],
  '/docs/software/auvik-installation': [
    {
      label: 'System Requirements',
      href: '/docs/software/system-requirements',
      description: 'Check requirements first',
    },
    {
      label: 'Network Configuration',
      href: '/docs/network/ip-addressing',
      description: 'Configure network settings',
    },
    {
      label: 'Troubleshooting: Collector Offline',
      href: '/docs/troubleshooting/collector-offline',
      description: 'Fix connectivity issues',
    },
    {
      label: 'Auvik Documentation',
      href: '/docs/reference/auvik-documentation',
      description: 'Official Auvik resources',
    },
  ],
  '/docs/software/system-requirements': [
    {
      label: 'Bill of Materials',
      href: '/docs/hardware/bill-of-materials',
      description: 'Recommended hardware',
    },
    {
      label: 'Operating System',
      href: '/docs/software/operating-system',
      description: 'OS installation guide',
    },
    {
      label: 'Optional Upgrades',
      href: '/docs/hardware/optional-upgrades',
      description: 'Hardware enhancements',
    },
  ],

  // Network
  '/docs/network/ip-addressing': [
    {
      label: 'VLAN Placement',
      href: '/docs/network/vlan-placement',
      description: 'Network segmentation setup',
    },
    {
      label: 'Firewall Rules',
      href: '/docs/network/firewall-rules',
      description: 'Required firewall configuration',
    },
    {
      label: 'On-Site Deployment',
      href: '/docs/deployment/on-site',
      description: 'Field installation steps',
    },
  ],
  '/docs/network/vlan-placement': [
    {
      label: 'IP Addressing',
      href: '/docs/network/ip-addressing',
      description: 'Network addressing scheme',
    },
    {
      label: 'Firewall Rules',
      href: '/docs/network/firewall-rules',
      description: 'Configure firewall access',
    },
    {
      label: 'PoE Compatibility',
      href: '/docs/hardware/poe-compatibility',
      description: 'VLAN and PoE switch setup',
    },
  ],
  '/docs/network/firewall-rules': [
    {
      label: 'IP Addressing',
      href: '/docs/network/ip-addressing',
      description: 'Network configuration',
    },
    {
      label: 'SNMP Configuration',
      href: '/docs/network/snmp-configuration',
      description: 'Monitoring protocol setup',
    },
    {
      label: 'Troubleshooting: Collector Offline',
      href: '/docs/troubleshooting/collector-offline',
      description: 'Fix connectivity issues',
    },
  ],
  '/docs/network/snmp-configuration': [
    {
      label: 'Firewall Rules',
      href: '/docs/network/firewall-rules',
      description: 'Allow SNMP traffic',
    },
    {
      label: 'Auvik Installation',
      href: '/docs/software/auvik-installation',
      description: 'Collector setup for monitoring',
    },
    {
      label: 'Common Issues',
      href: '/docs/troubleshooting/common-issues',
      description: 'SNMP troubleshooting',
    },
  ],

  // Remote Access
  '/docs/remote-access/tailscale-setup': [
    {
      label: 'SSH Jump Host',
      href: '/docs/remote-access/ssh-jump-host',
      description: 'Alternative remote access method',
    },
    {
      label: 'Operating System',
      href: '/docs/software/operating-system',
      description: 'OS configuration for remote access',
    },
    {
      label: 'Troubleshooting: Collector Offline',
      href: '/docs/troubleshooting/collector-offline',
      description: 'Remote diagnostics',
    },
  ],
  '/docs/remote-access/ssh-jump-host': [
    {
      label: 'Tailscale Setup',
      href: '/docs/remote-access/tailscale-setup',
      description: 'Easier remote access option',
    },
    {
      label: 'Firewall Rules',
      href: '/docs/network/firewall-rules',
      description: 'Allow SSH access',
    },
    {
      label: 'Common Issues',
      href: '/docs/troubleshooting/common-issues',
      description: 'Connection troubleshooting',
    },
  ],
  '/docs/remote-access/auvik-alerts': [
    {
      label: 'Auvik Installation',
      href: '/docs/software/auvik-installation',
      description: 'Configure collector alerts',
    },
    {
      label: 'Troubleshooting: Collector Offline',
      href: '/docs/troubleshooting/collector-offline',
      description: 'Respond to offline alerts',
    },
    {
      label: 'Post-Deployment',
      href: '/docs/deployment/post-deployment',
      description: 'Verify alerting setup',
    },
  ],

  // Golden Image
  '/docs/golden-image/image-contents': [
    {
      label: 'Per-Client Customization',
      href: '/docs/golden-image/per-client-customization',
      description: 'Client-specific configuration',
    },
    {
      label: 'Cloning Process',
      href: '/docs/golden-image/cloning-process',
      description: 'Deploy the golden image',
    },
    {
      label: 'Operating System',
      href: '/docs/software/operating-system',
      description: 'Manual OS setup alternative',
    },
  ],
  '/docs/golden-image/per-client-customization': [
    {
      label: 'Image Contents',
      href: '/docs/golden-image/image-contents',
      description: 'What\'s included in the image',
    },
    {
      label: 'Cloning Process',
      href: '/docs/golden-image/cloning-process',
      description: 'Deploy customized image',
    },
    {
      label: 'Pre-Deployment',
      href: '/docs/deployment/pre-deployment',
      description: 'Prepare for field deployment',
    },
  ],
  '/docs/golden-image/cloning-process': [
    {
      label: 'Image Contents',
      href: '/docs/golden-image/image-contents',
      description: 'Golden image components',
    },
    {
      label: 'Pre-Deployment',
      href: '/docs/deployment/pre-deployment',
      description: 'Next: Deploy to site',
    },
    {
      label: 'SD Card Failure',
      href: '/docs/troubleshooting/sd-card-failure',
      description: 'SD card best practices',
    },
  ],

  // Deployment
  '/docs/deployment/pre-deployment': [
    {
      label: 'On-Site Deployment',
      href: '/docs/deployment/on-site',
      description: 'Next: Field installation',
    },
    {
      label: 'Complete Deployment Checklist',
      href: '/docs/checklists/complete-deployment',
      description: 'Full deployment workflow',
    },
    {
      label: 'Bill of Materials',
      href: '/docs/hardware/bill-of-materials',
      description: 'Verify hardware inventory',
    },
    {
      label: 'Network Configuration',
      href: '/docs/network/ip-addressing',
      description: 'Pre-configure network settings',
    },
  ],
  '/docs/deployment/on-site': [
    {
      label: 'Pre-Deployment',
      href: '/docs/deployment/pre-deployment',
      description: 'Prepare before going on-site',
    },
    {
      label: 'Post-Deployment',
      href: '/docs/deployment/post-deployment',
      description: 'Next: Verify deployment',
    },
    {
      label: 'Quick Reference Checklist',
      href: '/docs/checklists/quick-reference',
      description: 'Field reference guide',
    },
    {
      label: 'Common Issues',
      href: '/docs/troubleshooting/common-issues',
      description: 'On-site troubleshooting',
    },
  ],
  '/docs/deployment/post-deployment': [
    {
      label: 'On-Site Deployment',
      href: '/docs/deployment/on-site',
      description: 'Review installation steps',
    },
    {
      label: 'Auvik Alerts',
      href: '/docs/remote-access/auvik-alerts',
      description: 'Monitor deployment',
    },
    {
      label: 'Common Issues',
      href: '/docs/troubleshooting/common-issues',
      description: 'Post-deployment checks',
    },
    {
      label: 'Complete Deployment Checklist',
      href: '/docs/checklists/complete-deployment',
      description: 'Verify all steps completed',
    },
  ],

  // Troubleshooting
  '/docs/troubleshooting/common-issues': [
    {
      label: 'Pi Not Powering',
      href: '/docs/troubleshooting/pi-not-powering',
      description: 'Power and PoE issues',
    },
    {
      label: 'Collector Offline',
      href: '/docs/troubleshooting/collector-offline',
      description: 'Network connectivity problems',
    },
    {
      label: 'SD Card Failure',
      href: '/docs/troubleshooting/sd-card-failure',
      description: 'Storage issues',
    },
    {
      label: 'Glossary',
      href: '/docs/reference/glossary',
      description: 'Technical terms reference',
    },
  ],
  '/docs/troubleshooting/pi-not-powering': [
    {
      label: 'PoE Compatibility',
      href: '/docs/hardware/poe-compatibility',
      description: 'Check PoE requirements',
    },
    {
      label: 'Bill of Materials',
      href: '/docs/hardware/bill-of-materials',
      description: 'Verify correct hardware',
    },
    {
      label: 'Common Issues',
      href: '/docs/troubleshooting/common-issues',
      description: 'Other troubleshooting topics',
    },
  ],
  '/docs/troubleshooting/collector-offline': [
    {
      label: 'Firewall Rules',
      href: '/docs/network/firewall-rules',
      description: 'Check network connectivity',
    },
    {
      label: 'IP Addressing',
      href: '/docs/network/ip-addressing',
      description: 'Verify network configuration',
    },
    {
      label: 'Tailscale Setup',
      href: '/docs/remote-access/tailscale-setup',
      description: 'Remote access for diagnostics',
    },
    {
      label: 'Common Issues',
      href: '/docs/troubleshooting/common-issues',
      description: 'General troubleshooting',
    },
  ],
  '/docs/troubleshooting/sd-card-failure': [
    {
      label: 'Optional Upgrades',
      href: '/docs/hardware/optional-upgrades',
      description: 'Higher quality SD cards',
    },
    {
      label: 'Cloning Process',
      href: '/docs/golden-image/cloning-process',
      description: 'Restore from golden image',
    },
    {
      label: 'Common Issues',
      href: '/docs/troubleshooting/common-issues',
      description: 'Prevention and recovery',
    },
  ],

  // Reference
  '/docs/reference/cost-analysis': [
    {
      label: 'Bill of Materials',
      href: '/docs/hardware/bill-of-materials',
      description: 'Detailed hardware costs',
    },
    {
      label: 'Optional Upgrades',
      href: '/docs/hardware/optional-upgrades',
      description: 'Upgrade cost comparison',
    },
    {
      label: 'Prerequisites',
      href: '/docs/getting-started/prerequisites',
      description: 'Budget planning',
    },
  ],
  '/docs/reference/auvik-documentation': [
    {
      label: 'Auvik Installation',
      href: '/docs/software/auvik-installation',
      description: 'Collector installation guide',
    },
    {
      label: 'System Requirements',
      href: '/docs/software/system-requirements',
      description: 'Auvik compatibility',
    },
    {
      label: 'SNMP Configuration',
      href: '/docs/network/snmp-configuration',
      description: 'Monitoring setup',
    },
  ],
  '/docs/reference/glossary': [
    {
      label: 'Common Issues',
      href: '/docs/troubleshooting/common-issues',
      description: 'Troubleshooting reference',
    },
    {
      label: 'Overview',
      href: '/docs/getting-started/overview',
      description: 'Getting started guide',
    },
    {
      label: 'Complete Deployment Checklist',
      href: '/docs/checklists/complete-deployment',
      description: 'Deployment workflow',
    },
  ],

  // Checklists
  '/docs/checklists/complete-deployment': [
    {
      label: 'Pre-Deployment',
      href: '/docs/deployment/pre-deployment',
      description: 'Detailed prep instructions',
    },
    {
      label: 'On-Site Deployment',
      href: '/docs/deployment/on-site',
      description: 'Field installation steps',
    },
    {
      label: 'Post-Deployment',
      href: '/docs/deployment/post-deployment',
      description: 'Verification procedures',
    },
    {
      label: 'Quick Reference',
      href: '/docs/checklists/quick-reference',
      description: 'Condensed checklist',
    },
  ],
  '/docs/checklists/quick-reference': [
    {
      label: 'Complete Deployment Checklist',
      href: '/docs/checklists/complete-deployment',
      description: 'Detailed workflow',
    },
    {
      label: 'Common Issues',
      href: '/docs/troubleshooting/common-issues',
      description: 'Quick troubleshooting',
    },
    {
      label: 'On-Site Deployment',
      href: '/docs/deployment/on-site',
      description: 'Field installation guide',
    },
  ],
};
