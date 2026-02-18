<script lang="ts">
	import CardSmall from "$lib/components/card-small.svelte";

	let { data } = $props();
</script>

{#await data.formattedPacks}
	<p>Loading...</p>
{:then versions}
	{#await data.cards}
		<p>Loading...</p>
	{:then cards}
		<div class="m-1 p-2 bg-header rounded-md">
			<div class="flex flex-wrap gap-1">
				{#each cards as card (card.id)}
					<CardSmall {card} pack={versions.current} />
				{/each}
			</div>
		</div>
	{/await}
{/await}
