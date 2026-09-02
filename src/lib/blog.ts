export function filtrerPublies<T extends { data: { brouillon: boolean } }>(
  articles: T[],
  inclureBrouillons: boolean,
): T[] {
  return inclureBrouillons ? articles : articles.filter((a) => !a.data.brouillon);
}

export function trierParDate<T extends { data: { date: Date } }>(articles: T[]): T[] {
  return [...articles].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function listerTags<T extends { data: { tags: string[] } }>(articles: T[]): string[] {
  const uniques = new Set(articles.flatMap((a) => a.data.tags));
  return [...uniques].sort((a, b) => a.localeCompare(b, 'fr'));
}
