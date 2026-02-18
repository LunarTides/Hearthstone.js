<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import type { Snippet } from "svelte";

	let {
		href,
		strict = false,
		children,
	}: {
		href: string;
		strict?: boolean;
		children: Snippet<[]>;
	} = $props();
</script>

<!-- If strict, the route needs to match exactly. -->
{#if strict ? page.route.id !== href : !page.route.id?.startsWith(href)}
	<a
		href={resolve(href, page.params)}
		class="p-2 w-full text-center flex justify-center gap-1 border-b hover:border-b-blue-300 active:border-b-blue-500"
	>
		{@render children()}
	</a>
{:else}
	<p
		title="You're already on this page."
		class="p-2 w-full text-center flex justify-center gap-1 border-b border-b-blue-400 hover:cursor-default"
		aria-disabled="true"
	>
		{@render children()}
	</p>
{/if}
