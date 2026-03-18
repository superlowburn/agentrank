import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = () => {
  return Response.redirect(new URL('/pricing/', 'https://agentrank-ai.com'), 302);
};
