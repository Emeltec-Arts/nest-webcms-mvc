export function slugGenerator(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
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