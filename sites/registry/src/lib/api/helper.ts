import type { RequestEvent } from "@sveltejs/kit";

export async function requestAPI<R>(
	event: RequestEvent,
	route: string,
	init?: RequestInit,
): Promise<
	(
		| { json: R; error: undefined }
		| { json: undefined; error: { message: string; status: number } }
	) & { raw: Response }
> {
	const response = await event.fetch(route, init);

	let json = undefined;
	try {
		json = await response.json();
	} catch {}
	// if (response.headers.get("Content-Type") === "application/json") {
	// 	try {
	// 		json = await response.json();
	// 	} catch {}
	// }

	if (response.status >= 400) {
		return {
			json: undefined,
			error: { message: json.message ?? "An error occurred.", status: response.status },
			raw: response,
		};
	}

	return { error: undefined, json, raw: response };
}
