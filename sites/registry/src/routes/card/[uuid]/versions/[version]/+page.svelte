<script lang="ts">
	import { page } from "$app/state";
	import type { Card } from "$lib/db/schema.js";
	import CardBig from "$lib/components/card-big.svelte";
	import PackBig from "$lib/components/pack-big.svelte";

	let { data, form } = $props();

	const getPack = (cards: Awaited<typeof data.cards>, card: Card) => {
		return cards.packs.all.find((p) => p.id === card.packId)!;
	};

	// Some real typescript magic right here. Wow...
	let card = $state<Promise<Card>>(Promise.resolve() as any);

	$effect(() => {
		(async () => {
			const cards = await data.cards;
			const found = cards.packs.all.find((v) => v.packVersion === page.params.version);
			if (!found) {
				// TODO: Error handling.
				return;
			}

			card = Promise.resolve(cards.all.find((c) => c.packId === found.id)!);
		})();
	});
</script>

{#await data.cards}
	<p>Loading...</p>
{:then cards}
	<PackBig
		packs={{
			...cards.packs,
			current: cards.packs.all.find((p) => p.packVersion === page.params.version)!,
		}}
		{cards}
		user={data.user}
		{form}
		individual
		class="rounded-b-none"
	/>

	{#await card}
		<p>Loading...</p>
	{:then card}
		<CardBig
			{cards}
			packs={{
				...cards.packs,
				current: getPack(cards, card),
			}}
		/>

		<!-- TODO: Show the card's code. -->
	{/await}
{/await}
