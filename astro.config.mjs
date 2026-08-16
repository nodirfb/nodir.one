// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://nodir.one',
  integrations: [mdx()],
  // English only at launch. Uzbek is a routing change later, not a type change:
  // both Plex faces carry U+02BB and U+02BC (verified from the font binaries).
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    routing: { prefixDefaultLocale: false },
  },
  build: { inlineStylesheets: 'always' },
});
