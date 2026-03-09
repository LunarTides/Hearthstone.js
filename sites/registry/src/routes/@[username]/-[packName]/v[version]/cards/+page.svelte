<script lang="ts">
	import CardSmall from "$lib/components/card-small.svelte";
	import Section from "$lib/components/section.svelte";

	let { data } = $props();
</script>

{#await data.formattedPacks}
	<p>Loading...</p>
{:then versions}
	{#await data.cards}
		<p>Loading...</p>
	{:then cards}
		<Section>
			<div class="flex flex-wrap gap-1">
				{#each cards as card (card.id)}
					<CardSmall {card} pack={versions.current} />
				{/each}
			</div>
		</Section>
	{/await}
{/await}
