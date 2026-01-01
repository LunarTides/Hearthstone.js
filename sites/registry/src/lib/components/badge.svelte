<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		class: className,
		title,
		children,
	}: {
		class: string;
		title?: string;
		children: Snippet<[]>;
	} = $props();
</script>

<p class={`p-1 px-2 rounded-md text-sm w-fit ${className}`} {title}>{@render children()}</p>
