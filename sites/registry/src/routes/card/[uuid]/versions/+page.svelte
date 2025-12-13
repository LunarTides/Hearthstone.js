<script lang="ts">
	import { resolve } from "$app/paths";
	import { m } from "$lib/paraglide/messages.js";
	import type { Card } from "$lib/db/schema.js";
	import CardBig from "$lib/components/card-big.svelte";
	import PackBig from "$lib/components/pack-big.svelte";

	let { data, form } = $props();

	const getPack = (cards: Awaited<typeof data.cards>, card: Card) => {
		return cards.packs.all.find((p) => p.id === card.packId)!;
	};
</script>

{#await data.cards}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then cards}
	<PackBig packs={cards.packs} {cards} user={data.user} {form} individual class="rounded-b-none" />
	<CardBig {cards} packs={cards.packs} />

	<div class="p-2 flex flex-col gap-2">
		{#each cards.all.toSorted( (a, b) => getPack(cards, b).packVersion.localeCompare(getPack(cards, a).packVersion), ) as card (card.id)}
			<a
				class="bg-blue-500 p-2 text-center rounded-full text-xl text-white hover:bg-blue-400 active:bg-blue-600"
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
