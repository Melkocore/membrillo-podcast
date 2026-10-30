import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const shows = defineCollection({
  loader: glob({ base: './src/content/shows', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    description: z.string(),
    hosts: z.array(z.string()).default([]),
    accent: z.string().default('#f0a63c'),
    feedUrl: z.string().url().optional(),
    spotify: z.string().url().optional(),
    youtube: z.string().url().optional(),
    order: z.number().default(99),
    draft: z.boolean().default(false),
  }),
});

const episodes = defineCollection({
  loader: glob({ base: './src/content/episodes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    show: z.string(),
    pubDate: z.coerce.date(),
    description: z.string(),
    duration: z.string().optional(),
    audioUrl: z.string().url().optional(),
    spotify: z.string().url().optional(),
    youtube: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const news = defineCollection({
  loader: glob({ base: './src/content/news', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const events = defineCollection({
  loader: glob({ base: './src/content/events', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string(),
    city: z.string().optional(),
    url: z.string().url().optional(),
    description: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { shows, episodes, news, events };
