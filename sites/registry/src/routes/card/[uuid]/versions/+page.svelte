<script lang="ts">
	import { resolve } from "$app/paths";
	import { m } from "$lib/paraglide/messages.js";
	import { goto } from "$app/navigation";
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
	<PackBig
		pack={cards.packs.latest}
		all={cards.packs.all}
		cards={cards.all}
		user={data.user}
		{form}
		class="rounded-b-none"
	/>
	<CardBig
		card={cards.latest}
		cardsAll={cards.all}
		pack={cards.packs.latest}
		packsAll={cards.packs.all}
	/>

	<div class="p-2 flex flex-col gap-2">
		{#each cards.all.toSorted( (a, b) => getPack(cards, b).packVersion.localeCompare(getPack(cards, a).packVersion), ) as card (card.id)}
			<button
				class="bg-blue-500 p-2 rounded-full text-xl text-white hover:bg-blue-400 hover:cursor-pointer active:bg-blue-600"
				onclick={() => {
					goto(
						resolve("/card/[uuid]/versions/[version]", {
							uuid: card.uuid,
							version: getPack(cards, card).packVersion,
						}),
					);
				}}
			>
				{getPack(cards, card).packVersion}
			</button>
		{/each}
	</div>
{/await}
