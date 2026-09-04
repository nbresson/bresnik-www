import { produitsPublies } from '../../lib/catalogue';

export async function GET() {
  const produits = (await produitsPublies()).map((p) => p.id);
  return new Response(JSON.stringify({ produits }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}
