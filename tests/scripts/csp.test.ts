import { describe, expect, it } from 'vitest';
import { empreinte, verifierPage } from '../../scripts/csp.mjs';

const page = (csp: string, corps: string) => `<html><head><meta http-equiv="content-security-policy" content="${csp}"></head><body>${corps}</body></html>`;

describe('verifierPage', () => {
  it('accepte une page dont chaque script et style en ligne a son empreinte', () => {
    const script = "console.log('a')";
    const style = 'body{margin:0}';
    const csp = `script-src &#39;self&#39; &#39;${empreinte(script)}&#39;; style-src &#39;${empreinte(style)}&#39;`;
    expect(verifierPage(page(csp, `<script>${script}</script><style>${style}</style>`))).toEqual([]);
  });

  it('ignore les scripts externes et les blocs JSON', () => {
    const csp = "script-src &#39;self&#39;";
    expect(verifierPage(page(csp, '<script src="/a.js"></script><script type="application/json" id="x">{"a":1}</script>'))).toEqual([]);
  });

  it('signale un script sans empreinte, un attribut style et une CSP absente', () => {
    expect(verifierPage(page("script-src &#39;self&#39;", '<script>alert(1)</script><p style="color:red">x</p>'))).toEqual([
      'script en ligne sans empreinte : alert(1)',
      '1 attribut(s) style',
    ]);
    expect(verifierPage('<html><head></head></html>')).toEqual(['CSP absente']);
  });
});
