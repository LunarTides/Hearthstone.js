<script lang="ts">
	import type { Snippet } from "svelte";

	const {
		alternate,
		details,
		summary,
		open,
		children,
	}: {
		alternate?: boolean;
		details?: boolean;
		summary?: string;
		open?: boolean;
		children: Snippet<[]>;
	} = $props();
</script>

<div class={`m-1 p-2 ${alternate ? "bg-background" : "bg-header"} rounded-md`}>
	{#if details}
		<details {open}>
			<summary>{summary ?? "Details"}</summary>
			{@render children()}
		</details>
	{:else}
		{@render children()}
	{/if}
</div>
