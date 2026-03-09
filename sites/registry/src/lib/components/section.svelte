<script lang="ts">
	import type { Snippet } from "svelte";

	const {
		alternate,
		details,
		summary,
		open,
		class: className,
		children,
	}: {
		alternate?: boolean;
		details?: boolean;
		summary?: string;
		open?: boolean;
		class?: string;
		children: Snippet<[]>;
	} = $props();
</script>

<div class={`m-1 p-2 ${alternate ? "bg-background" : "bg-header"} rounded-md ${className}`}>
	{#if details}
		<details {open}>
			<summary>{summary ?? "Details"}</summary>
			{@render children()}
		</details>
	{:else}
		{@render children()}
	{/if}
</div>
