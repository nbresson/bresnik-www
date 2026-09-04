import { produitsPublies } from '../../lib/catalogue';

export async function GET() {
  const produits = (await produitsPublies()).map((p) => ({ id: p.id, nom: p.data.nom }));
  return new Response(JSON.stringify({ produits }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}
