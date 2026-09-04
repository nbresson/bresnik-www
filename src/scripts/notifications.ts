// Notifications éphémères : `notifier()` ajoute un message dans la zone
// `#notifications` (role="status"), refermable, retiré après un délai.
export type TonNotification = 'information' | 'succes' | 'avertissement' | 'erreur';

export interface OptionsNotification {
  texte: string;
  ton?: TonNotification;
  /** Durée d'affichage en millisecondes ; 0 pour laisser affiché. */
  duree?: number;
}

declare global {
  interface Window {
    bkNotifier?: (options: OptionsNotification) => void;
    bkNotificationsInitialisees?: boolean;
  }
}

const bordures: Record<TonNotification, string> = {
  information: 'border-l-cobalt',
  succes: 'border-l-succes',
  avertissement: 'border-l-ambre',
  erreur: 'border-l-erreur',
};

export function notifier({ texte, ton = 'information', duree = 5000 }: OptionsNotification): void {
  const zone = document.getElementById('notifications');
  if (!zone) return;
  const carte = document.createElement('div');
  carte.className = `flex items-start gap-3 rounded-carte border border-ligne border-l-4 bg-blanc px-4 py-3 text-[15px] text-encre shadow-capture ${bordures[ton]}`;
  const message = document.createElement('p');
  message.className = 'grow';
  message.textContent = texte;
  const fermer = document.createElement('button');
  fermer.type = 'button';
  fermer.className = 'inline-flex size-8 shrink-0 items-center justify-center rounded-bouton text-encre-2 hover:bg-papier-2 hover:text-encre';
  fermer.setAttribute('aria-label', 'Fermer la notification');
  fermer.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12"></path><path d="M18 6L6 18"></path></svg>';
  fermer.addEventListener('click', () => carte.remove());
  carte.append(message, fermer);
  zone.append(carte);
  if (duree > 0) window.setTimeout(() => carte.remove(), duree);
}

if (!window.bkNotificationsInitialisees) {
  window.bkNotificationsInitialisees = true;
  window.bkNotifier = notifier;
  document.addEventListener('click', (evenement) => {
    const declencheur = (evenement.target as Element | null)?.closest('[data-notifier]');
    if (!declencheur) return;
    try {
      notifier(JSON.parse(declencheur.getAttribute('data-notifier') ?? '{}'));
    } catch {
      notifier({ texte: 'Notification', ton: 'information' });
    }
  });
}
