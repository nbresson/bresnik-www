import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { filtrerPublies, trierParDate } from '../lib/blog';

export async function GET(context: APIContext) {
  const articles = trierParDate(filtrerPublies(await getCollection('blog'), false));
  return rss({
    title: 'Blog Bresnik',
    description: "Retours d'expérience sur Sage 100, SQL Server et les Objets métiers Sage.",
    site: context.site!,
    items: articles.map((article) => ({
      title: article.data.titre,
      description: article.data.description,
      pubDate: article.data.date,
      link: `/blog/${article.id}/`,
    })),
    customData: '<language>fr-fr</language>',
  });
}
