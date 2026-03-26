import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { exec } from "node:child_process";
import { promisify } from "node:util";

// Get commit hash and last modified date using git.
const asyncExec = promisify(exec);
const [commitHash, lastModified] = (
	await Promise.allSettled([
		asyncExec("git rev-parse --short origin/main"),
		asyncExec("git log -1 --format=%cd --date=format:'%Y-%m-%d %H:%M:%S' origin/main"),
	])
).map((v) => (v.status === "rejected" ? "error" : JSON.stringify(v.value.stdout.trim())));

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	define: {
		__COMMIT_HASH__: commitHash,
		__LAST_MODIFIED__: lastModified,
	},
});
