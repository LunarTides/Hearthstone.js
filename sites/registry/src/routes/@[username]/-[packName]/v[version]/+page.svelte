<script lang="ts">
	import Section from "$lib/components/section.svelte";

	let { data } = $props();
</script>

<!-- Readme -->
<Section>
	{#if data.readme}
		<div class="markdown">
			{@html data.readmeHTML}
		</div>
	{:else}
		<p>No README file found.</p>
	{/if}
</Section>
