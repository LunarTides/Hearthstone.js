<script lang="ts">
	import ResourceSmall from "$lib/components/resource-small.svelte";
	import Section from "$lib/components/section.svelte";

	let { data } = $props();
</script>

{#await data.formattedPacks}
	<p>Loading...</p>
{:then versions}
	{#await data.resources}
		<p>Loading...</p>
	{:then resources}
		<Section>
			<div class="flex flex-wrap gap-1">
				{#each resources as resource (resource.id)}
					<ResourceSmall {resource} pack={versions.current} />
				{/each}
			</div>
		</Section>
	{/await}
{/await}
