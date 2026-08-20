export interface Bookmark {
  url: string;
  slug: string;
}

const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SLUG_PATTERN = /^mona-[0-9A-Za-z]+$/;

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new TypeError('Enter a URL to save.');
  }

  const withProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(withProtocol);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError('Enter an HTTP or HTTPS URL.');
  }

  return url.href;
}

export function parseBookmarks(rawValue: string | null): Bookmark[] {
  if (!rawValue) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((value): value is Bookmark => {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Record<string, unknown>;
    if (
      typeof candidate.url !== 'string' ||
      typeof candidate.slug !== 'string' ||
      !SLUG_PATTERN.test(candidate.slug)
    ) {
      return false;
    }

    try {
      const url = new URL(candidate.url);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  });
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

export function nextSlug(bookmarks: Bookmark[]): string {
  const existingSlugs = new Set(bookmarks.map(({ slug }) => slug));
  let counter = bookmarks.length + 1;
  let slug = `mona-${toBase62(counter)}`;

  while (existingSlugs.has(slug)) {
    counter += 1;
    slug = `mona-${toBase62(counter)}`;
  }

  return slug;
}

function toBase62(value: number): string {
  let remaining = value;
  let encoded = '';

  do {
    encoded = BASE62_ALPHABET[remaining % BASE62_ALPHABET.length] + encoded;
    remaining = Math.floor(remaining / BASE62_ALPHABET.length);
  } while (remaining > 0);

  return encoded;
}
