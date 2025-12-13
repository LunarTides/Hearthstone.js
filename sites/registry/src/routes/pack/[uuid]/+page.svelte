<script lang="ts">
	import { m } from "$lib/paraglide/messages.js";
	import PackBig from "$lib/components/pack-big.svelte";
	import CardSmall from "$lib/components/card-small.svelte";

	let { data, form } = $props();
</script>

{#await data.packs}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then packs}
	{#if packs}
		{#await data.cards}
			<p>{m.tidy_fancy_mule_prosper()}</p>
		{:then cards}
			<PackBig {packs} cards={{ all: cards! }} user={data.user} {form} />

			<div class="m-2 flex flex-wrap gap-1">
				{#each cards as card (card.id)}
					<CardSmall {card} pack={packs.latest} />
				{/each}
			</div>
		{/await}
	{/if}

	<!-- <pre>{JSON.stringify(packs, null, 4)}</pre> -->
{/await}
