// Ouverture et fermeture des boîtes de dialogue natives (modale, panneau
// latéral, confirmation). Délégation d'événements, un seul branchement par page.
declare global {
  interface Window {
    bkDialoguesInitialises?: boolean;
  }
}

function dialogueDepuis(element: Element | null): HTMLDialogElement | null {
  const identifiant = element?.getAttribute('data-ouvre-dialogue');
  if (!identifiant) return null;
  const dialogue = document.getElementById(identifiant);
  return dialogue instanceof HTMLDialogElement ? dialogue : null;
}

if (!window.bkDialoguesInitialises) {
  window.bkDialoguesInitialises = true;

  document.addEventListener('click', (evenement) => {
    const cible = evenement.target as Element | null;
    const ouvreur = cible?.closest('[data-ouvre-dialogue]');
    const dialogue = dialogueDepuis(ouvreur ?? null);
    if (dialogue) {
      dialogue.showModal();
      return;
    }
    const fermeur = cible?.closest('[data-ferme-dialogue]');
    if (fermeur) {
      const parent = fermeur.closest('dialog');
      if (parent instanceof HTMLDialogElement) parent.close(fermeur.getAttribute('data-ferme-dialogue') || '');
      return;
    }
    // Clic sur l'arrière-plan : la cible est le dialogue lui-même, pas son contenu.
    if (cible instanceof HTMLDialogElement && cible.hasAttribute('data-ferme-arriere-plan')) {
      cible.close('');
    }
  });

  document.addEventListener('close', (evenement) => {
    const dialogue = evenement.target;
    if (!(dialogue instanceof HTMLDialogElement) || !dialogue.hasAttribute('data-confirmation')) return;
    document.dispatchEvent(
      new CustomEvent('bk-confirmation', { detail: { id: dialogue.id, confirme: dialogue.returnValue === 'confirmer' } }),
    );
  }, true);
}

export {};
