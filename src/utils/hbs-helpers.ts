import * as hbs from 'hbs';

export function registerHelpers() {
  hbs.registerHelper('formatDate', function(date: Date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  hbs.registerHelper('truncate', function(text: string, length: number) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  });

  hbs.registerHelper('eq', function(a: any, b: any) {
    return a === b;
  });

  hbs.registerHelper('add', function(a: number, b: number) {
    return a + b;
  });

  hbs.registerHelper('subtract', function(a: number, b: number) {
    return a - b;
  });
}
