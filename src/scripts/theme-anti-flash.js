// Applique le thème mémorisé avant le premier rendu pour éviter tout flash.
// Inséré tel quel dans <head> ; son empreinte SHA-256 est déclarée dans la CSP (astro.config.mjs).
try {
  var theme = localStorage.getItem('bresnik-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch (erreur) {}
