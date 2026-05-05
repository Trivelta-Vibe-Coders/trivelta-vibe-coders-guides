import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const apps = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/apps' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      name: z.string(),
      tagline: z.string().max(120),
      live: z.boolean().default(false),
      internal: z.boolean().default(false),
      stack: z.array(z.string()),
      ai_tools: z.array(z.string()),
      live_url: z.string().url().nullable(),
      repo_url: z.string().url(),
      hero_image: image(),
      secondary_image: image().optional(),
      guest_credentials: z
        .object({ email: z.string().email(), password: z.string() })
        .optional(),
      built_by: z.string(),
      shipped: z.string().regex(/^\d{4}-\d{2}$/),
      blurb: z.string(),
      order: z.number().optional(),
    }),
});

export const collections = { apps };
