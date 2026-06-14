import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPosts, getPostDescription, getPostPath } from '../lib/posts';
import { SITE } from '../lib/site';

export async function GET(context: APIContext) {
  const posts = await getAllPosts();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.slice(0, 20).map((post) => ({
      title: post.data.title,
      description: getPostDescription(post),
      pubDate: post.data.date,
      link: getPostPath(post)
    }))
  });
}
