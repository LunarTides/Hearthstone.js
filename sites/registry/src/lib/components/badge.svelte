<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		class: className,
		children,
	}: {
		class: string;
		children: Snippet<[]>;
	} = $props();
</script>

<p class={`p-1 px-2 rounded-full text-sm w-fit ${className}`}>{@render children()}</p>
