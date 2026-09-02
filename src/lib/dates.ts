const formateur = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' });

export function formaterDate(date: Date): string {
  return formateur.format(date);
}

export function dateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}
