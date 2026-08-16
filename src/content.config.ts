import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * A layer string is budgeted, not merely advised.
 *
 * At 360px the depth-3 layer line is 39 characters of IBM Plex Mono (1ch is
 * exactly 0.600em — verified from the font binary), and the label column takes
 * 7 of them. That leaves 32. Anything longer wraps, and a wrapped layer line
 * breaks the one thing the design depends on: that a line's left edge is
 * readable at a glance. So the budget fails the build instead of failing
 * silently on a phone.
 */
const layerText = z
  .string()
  .max(32, 'Layer text must fit the 32-character budget set by the 360px depth-3 line.');

const layers = z
  .object({
    store: layerText.optional(),
    move: layerText.optional(),
    read: layerText.optional(),
    write: layerText.optional(),
  })
  .refine((l) => Object.values(l).some(Boolean), {
    message: 'A project must touch at least one layer of the chain.',
  });

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(120, 'One line. 120 characters is the index row budget.'),
    // Depth is DERIVED from `layers`, never authored — a title's indent is a fact
    // about the project, not a styling choice someone can nudge.
    layers,
    stack: z.array(z.string()).nonempty(),
    order: z.number(),
    draft: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160, 'Doubles as the meta description.'),
    // Optional on purpose. An unwritten post has no date, and a placeholder date
    // is a fabricated timeline that ships silently. Absent renders as [TO'LDIR].
    pubDate: z.coerce.date().optional(),
    readingMinutes: z.number().int().positive().optional(),
    // The index is explicitly ordered. Dates are absent until a post is real, so
    // sorting by date would silently degrade to glob order and "three most recent"
    // would stop being true. Lowest number first.
    order: z.number(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
