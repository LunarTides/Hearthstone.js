<script lang="ts">
	import { page } from "$app/state";
	import CardSmall from "$lib/components/card-small.svelte";
	import type { PackWithExtras } from "$lib/db/schema.js";

	let { data } = $props();

	// Some real typescript magic right here. Wow...
	let packs = $state<
		Promise<{ current: PackWithExtras; latest: PackWithExtras; all: PackWithExtras[] }>
	>(Promise.resolve() as any);

	let canEditPack = $state(false);
	let cardsOpen = $state(page.url.hash.startsWith("#card"));

	$effect(() => {
		(async () => {
			const ps = await data.packs;
			const found = ps.all.find((v) => v.id === page.params.id);
			if (!found) {
				// TODO: Error handling.
				return;
			}

			packs = Promise.resolve({ current: found, latest: ps.latest, all: ps.all });
			canEditPack = found.ownerName === data.user?.username;
		})();
	});
</script>

{#await packs}
	<p>Loading...</p>
{:then versions}
	{#await data.cards}
		<p>Loading...</p>
	{:then cards}
		<div class="m-1 p-2 bg-header rounded-md">
			<div class="flex flex-wrap gap-1">
				<!-- TODO: This doesn't show cards in not-approved versions. -->
				{#each cards as card (card.id)}
					<CardSmall {card} pack={versions.current} />
				{/each}
			</div>
		</div>
	{/await}
{/await}
