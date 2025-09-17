// Type declarations for whois-json module

declare module 'whois-json' {
  interface WhoisResult {
    [key: string]: any;
  }

  function whoisLookup(domain: string): Promise<string>;
  export = whoisLookup;
}