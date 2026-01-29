import { redirect } from '@sveltejs/kit';

const LATEST_VERSION = "v1";

export function fallback(event) {
  redirect(307, event.request.url.replace("/api/latest/", `/api/${LATEST_VERSION}/`));
}
