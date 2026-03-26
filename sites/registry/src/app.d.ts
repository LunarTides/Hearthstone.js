// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import("$lib/server/auth").SessionValidationResult["user"];
			session: import("$lib/server/auth").SessionValidationResult["session"];
			token: import("$lib/server/auth").GradualTokenValidationResult["token"];
		}
	}

	const __COMMIT_HASH__: string;
	const __LAST_MODIFIED__: string;

	// interface Error {}
	// interface Locals {}
} // interface PageData {}
// interface PageState {}
// interface Platform {}

export {};
