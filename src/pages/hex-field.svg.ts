import type { APIRoute } from 'astro';
import { buildHexField } from '@lib/hex-field';

export const GET: APIRoute = () => new Response(buildHexField(), { headers: { 'Content-Type': 'image/svg+xml' } });
