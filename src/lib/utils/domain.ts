export function cleanDomain(input: string): string {
  let domain = input.replace(/^https?:\/\//, '');
  domain = domain.replace(/^www\./, '');
  domain = domain.split('/')[0];
  domain = domain.split(':')[0];
  return domain.toLowerCase();
}