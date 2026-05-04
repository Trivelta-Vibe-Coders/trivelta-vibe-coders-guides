import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const apps = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/apps' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      name: z.string(),
      tagline: z.string().max(120),
      status: z.enum(['live', 'internal', 'wip']),
      stack: z.array(z.string()),
      ai_tools: z.array(z.string()),
      live_url: z.string().url().nullable(),
      repo_url: z.string().url(),
      hero_image: image(),
      secondary_image: image().optional(),
      built_by: z.string(),
      shipped: z.string().regex(/^\d{4}-\d{2}$/),
      blurb: z.string(),
      order: z.number().optional(),
    }),
});

export const collections = { apps };
