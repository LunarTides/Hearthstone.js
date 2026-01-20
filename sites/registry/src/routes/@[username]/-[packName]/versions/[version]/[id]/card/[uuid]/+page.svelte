<script lang="ts">
	import { page } from "$app/state";
	import type { Card } from "$lib/db/schema.js";
	import CardBig from "$lib/components/card-big.svelte";
	import { Highlight, LineNumbers } from "svelte-highlight";
	import { typescript } from "svelte-highlight/languages/typescript";
	import { resolve } from "$app/paths";

	let { data } = $props();

	// Some real typescript magic right here. Wow...
	let card = $state<Promise<Card>>(Promise.resolve() as any);

	let versionsOpen = $state(page.url.hash.startsWith("#version"));

	$effect(() => {
		(async () => {
			const cards = await data.relevantCards;
			const found = cards.packs.all.find((v) => v.id === page.params.id);
			if (!found) {
				// TODO: Error handling.
				return;
			}

			card = Promise.resolve(cards.all.find((c) => c.packId === found.id)!);
		})();
	});

	const getPack = (cards: Awaited<typeof data.relevantCards>, card: Card) => {
		return cards.packs.all.find((p) => p.id === card.packId)!;
	};
</script>

{#await data.relevantCards}
	<p>Loading...</p>
{:then cards}
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

		<!-- Versions -->
		<div class="m-1 p-2 bg-header rounded-md">
			<details bind:open={versionsOpen}>
				<summary>Versions ({cards.all.length})</summary>
				<div class="m-1 flex flex-col gap-2">
					<a
						id="version-latest"
						class="bg-background p-2 text-center rounded-full text-xl text-white target:outline-1"
						href={resolve("/@[username]/-[packName]/versions/[version]/[id]/card/[uuid]", {
							username: page.params.username!,
							packName: page.params.packName!,
							version: cards.packs.latest.packVersion,
							id: cards.packs.latest.id,
							uuid: card.uuid,
						})}
					>
						Latest
						<span class="text-gray-700">({cards.latest.id.split("-").at(-1)!.slice(0, 6)})</span>
					</a>

					<hr class="border" style="border-color: var(--color-background);" />

					{#each cards.all.toSorted( (a, b) => getPack(cards, b).packVersion.localeCompare(getPack(cards, a).packVersion), ) as card (card.id)}
						<a
							id={`version-${card.id}`}
							href={resolve("/@[username]/-[packName]/versions/[version]/[id]/card/[uuid]", {
								username: page.params.username!,
								packName: page.params.packName!,
								version: getPack(cards, card).packVersion,
								id: getPack(cards, card).id,
								uuid: card.uuid,
							})}
							class="bg-background p-2 rounded-full text-xl text-center text-white target:outline-1"
						>
							{getPack(cards, card).packVersion}
							<span class="text-gray-700">({card.id.split("-").at(-1)!.slice(0, 6)})</span>
						</a>
					{/each}
				</div>
			</details>
		</div>

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
