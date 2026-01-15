<script lang="ts">
	import { page } from "$app/state";
	import type { Card } from "$lib/db/schema.js";
	import CardBig from "$lib/components/card-big.svelte";
	import PackBig from "$lib/components/pack-big.svelte";
	import { Highlight, LineNumbers } from "svelte-highlight";
	import { typescript } from "svelte-highlight/languages/typescript";

	let { data, form } = $props();

	// Some real typescript magic right here. Wow...
	let card = $state<Promise<Card>>(Promise.resolve() as any);

	$effect(() => {
		(async () => {
			const cards = await data.cards;
			const found = cards.packs.all.find((v) => v.id === page.params.id);
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
			current: cards.packs.all.find((p) => p.id === page.params.id)!,
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
			cards={{
				...cards,
				current: card,
			}}
			packs={{
				...cards.packs,
				current: cards.packs.all.find((p) => p.id === card.packId)!,
			}}
		/>

		<div class="m-1">
			<Highlight
				language={typescript}
				code={cards.files.find((f) => f.id === card.id)!.file.content}
				let:highlighted
			>
				<LineNumbers class="rounded-md" {highlighted} />
			</Highlight>
		</div>
	{/await}
{/await}
