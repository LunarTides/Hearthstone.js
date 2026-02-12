<script lang="ts">
	import { page } from "$app/state";
	import type { Card } from "$lib/db/schema.js";
	import CardBig from "$lib/components/card-big.svelte";
	import { Highlight, LineNumbers } from "svelte-highlight";
	import { typescript } from "svelte-highlight/languages/typescript";
	import { resolve } from "$app/paths";

	let { data } = $props();

	let versionsOpen = $state(page.url.hash.startsWith("#version"));

	// TODO: Move this to server-side.
	const getPack = (cards: Awaited<typeof data.relevantCards>, card: Card) => {
		return cards.packs.all.find((p) => p.id === card.packId)!;
	};
</script>

{#await data.relevantCards}
	<p>Loading...</p>
{:then cards}
	<CardBig card={cards.current} pack={cards.currentPack} />

	<!-- Versions -->
	<div class="m-1 p-2 bg-header rounded-md">
		<details bind:open={versionsOpen}>
			<summary>Versions ({cards.all.length})</summary>
			<div class="m-1 flex flex-col gap-2">
				<a
					id="version-latest"
					class="bg-background p-2 text-center rounded-full text-xl text-white target:outline-1"
					href={resolve("/@[username]/-[packName]/versions/[version]/[id]/cards/[uuid]", {
						username: page.params.username!,
						packName: page.params.packName!,
						version: cards.packs.latest.packVersion,
						id: cards.packs.latest.id,
						uuid: cards.current.uuid,
					})}
				>
					Latest
					<span class="text-gray-700">({cards.latest.id.split("-").at(-1)!.slice(0, 6)})</span>
				</a>

				<hr class="border" style="border-color: var(--color-background);" />

				{#each cards.all.toSorted( (a, b) => getPack(cards, b).packVersion.localeCompare(getPack(cards, a).packVersion), ) as card (card.id)}
					<a
						id={`version-${card.id}`}
						href={resolve("/@[username]/-[packName]/versions/[version]/[id]/cards/[uuid]", {
							username: page.params.username!,
							packName: page.params.packName!,
							version: getPack(cards, card).packVersion,
							id: card.packId,
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
			code={cards.files.find((f) => f.id === cards.current.id)!.file.content}
			let:highlighted
		>
			<LineNumbers class="rounded-md" {highlighted} />
		</Highlight>
	</div>
{/await}
