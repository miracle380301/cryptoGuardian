'use client';

import { ExternalLink } from "lucide-react";

interface ExternalLinkConfig {
  url: string;
  label: string;
  title: string;
}

interface CheckExternalLinksProps {
  checkType: 'whois' | 'ssl' | 'safeBrowsing';
  domain: string;
  translations: {
    viewWhois?: string;
    sslLabs?: string;
    ctLogs?: string;
    googleCT?: string;
    safeBrowsing?: string;
    sucuri?: string;
    urlVoid?: string;
  };
}

export default function CheckExternalLinks({ checkType, domain, translations }: CheckExternalLinksProps) {
  const getLinkConfigs = (): ExternalLinkConfig[] => {
    switch (checkType) {
      case 'whois':
        return [
          {
            url: `https://www.whois.com/whois/${domain}`,
            label: translations.viewWhois || 'View WHOIS',
            title: 'WHOIS Information'
          }
        ];

      case 'ssl':
        return [
          {
            url: `https://www.ssllabs.com/ssltest/analyze.html?d=${domain}`,
            label: translations.sslLabs || 'SSL Labs',
            title: 'Qualys SSL Labs Test'
          },
          {
            url: `https://crt.sh/?q=${domain}`,
            label: translations.ctLogs || 'CT Logs',
            title: 'Certificate Transparency Logs'
          },
          {
            url: `https://transparencyreport.google.com/https/certificates?domain=${domain}`,
            label: translations.googleCT || 'Google CT',
            title: 'Google Certificate Transparency'
          }
        ];

      case 'safeBrowsing':
        return [
          {
            url: `https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent('http://' + domain)}`,
            label: translations.safeBrowsing || 'Safe Browsing',
            title: 'Google Safe Browsing Status'
          },
          {
            url: `https://sitecheck.sucuri.net/results/${domain}`,
            label: translations.sucuri || 'Sucuri',
            title: 'Sucuri Website Security Check'
          },
          {
            url: `https://www.urlvoid.com/scan/${domain}`,
            label: translations.urlVoid || 'URLVoid',
            title: 'URLVoid Malware Scanner'
          }
        ];

      default:
        return [];
    }
  };

  const linkConfigs = getLinkConfigs();

  if (linkConfigs.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {linkConfigs.map((config, index) => (
        <a
          key={index}
          href={config.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          title={config.title}
        >
          <ExternalLink className="w-3 h-3" />
          <span>{config.label}</span>
        </a>
      ))}
    </div>
  );
}