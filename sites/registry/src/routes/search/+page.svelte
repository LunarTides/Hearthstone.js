<script lang="ts">
	import CardSmall from "$lib/components/card-small.svelte";
	import PackSmall from "$lib/components/pack-small.svelte";

	let { data } = $props();

	// TODO: Add pagination.
</script>

<div class="flex">
	<div class="ml-3">
		<p class="text-xl m-2 ml-0 font-mono">Packs</p>
		<hr />
		<div class="flex mt-2 gap-1">
			{#await data.packs}
				<p>Loading...</p>
			{:then packs}
				{#if packs.length <= 0}
					<p>No results.</p>
				{/if}

				{#each packs.toSorted((a, b) => b.totalDownloadCount - a.totalDownloadCount) as p (p.id)}
					<PackSmall pack={p} clientUser={data.user} />
				{/each}
			{/await}
		</div>
	</div>

	<div class="border-l ml-auto h-screen"></div>

	<div class="ml-auto mr-3">
		<p class="text-xl m-2 ml-0 font-mono">Cards</p>
		<hr />
		<div class="flex flex-col mt-2 gap-1">
			{#await data.cards}
				<p>Loading...</p>
			{:then cards}
				{#if cards.length <= 0}
					<p>No results.</p>
				{/if}

				{#each cards as c (c.card.id)}
					<CardSmall card={c.card} pack={c.pack} />
				{/each}
			{/await}
		</div>
	</div>
</div>
