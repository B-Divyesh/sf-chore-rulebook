export const checkoutUrl = 'https://api.sociobot.in/api/v1/products/chore-rulebook/checkout';
const key = 'sb_license:chore-rulebook';
const verdictKey = `${key}:verdict`;
const verifyUrl = 'https://api.sociobot.in/api/v1/products/chore-rulebook/verify';

interface Verdict { valid: boolean; checkedAt: number }

export function captureLicense(): string | null {
  const url = new URL(location.href);
  const incoming = url.searchParams.get('license');
  if (incoming) {
    localStorage.setItem(key, incoming.trim());
    localStorage.removeItem(verdictKey);
    url.searchParams.delete('license');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }
  return incoming;
}

export function storedLicense(): string { return localStorage.getItem(key) ?? ''; }

export function saveLicense(token: string): void {
  localStorage.setItem(key, token.trim());
  localStorage.removeItem(verdictKey);
}

export function cachedUnlock(): boolean {
  if (!storedLicense()) return false;
  try {
    const verdict = JSON.parse(localStorage.getItem(verdictKey) ?? '') as Verdict;
    return verdict.valid;
  } catch { return false; }
}

export async function verifyLicense(force = false): Promise<boolean> {
  const license = storedLicense();
  if (!license) return false;
  try {
    const verdict = JSON.parse(localStorage.getItem(verdictKey) ?? '') as Verdict;
    if (!force && Date.now() - verdict.checkedAt < 86_400_000) return verdict.valid;
  } catch { /* first verification */ }
  const response = await fetch(`${verifyUrl}?license=${encodeURIComponent(license)}`);
  if (!response.ok) throw new Error('License verification is temporarily unavailable.');
  const result = await response.json() as { valid: boolean };
  localStorage.setItem(verdictKey, JSON.stringify({ valid: result.valid, checkedAt: Date.now() } satisfies Verdict));
  return result.valid;
}
