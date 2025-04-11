export function slugGenerator(text: string): string {
  const baseSlug = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const randomId = generateShortId(6);
  return `${baseSlug}-${randomId}`;
}

export function slugGeneratorParams(text: string, options: { replace: string, lower: boolean } = { replace: '-', lower: true }): string {
  let slug = text;
  if (options.lower) {
    slug = slug.toLowerCase();
  }
  slug = slug.replace(/[^a-z0-9\s]/gi, '')
    .trim()
    .replace(/\s+/g, options.replace);

  return slug;
}

function generateShortId(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}