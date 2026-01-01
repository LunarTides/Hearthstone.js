<script lang="ts">
	import { resolve } from "$app/paths";
	import type { Card } from "$lib/db/schema.js";
	import CardBig from "$lib/components/card-big.svelte";
	import PackBig from "$lib/components/pack-big.svelte";

	let { data, form } = $props();

	const getPack = (cards: Awaited<typeof data.cards>, card: Card) => {
		return cards.packs.all.find((p) => p.id === card.packId)!;
	};
</script>

{#await data.cards}
	<p>Loading...</p>
{:then cards}
	<PackBig packs={cards.packs} {cards} user={data.user} {form} individual class="rounded-b-none" />
	<CardBig {cards} packs={cards.packs} />

	<div class="p-2 flex flex-col gap-2">
		{#each cards.all.toSorted( (a, b) => getPack(cards, b).packVersion.localeCompare(getPack(cards, a).packVersion), ) as card (card.id)}
			<a
				class="bg-header p-2 text-center rounded-full text-xl"
				href={resolve("/card/[uuid]/versions/[version]", {
					uuid: card.uuid,
					version: getPack(cards, card).packVersion,
				})}
			>
				{getPack(cards, card).packVersion}
			</a>
		{/each}
	</div>
{/await}
