<script lang="ts">
	import CardSmall from "$lib/components/card-small.svelte";
	import PackSmall from "$lib/components/pack-small.svelte";
	import { m } from "$lib/paraglide/messages.js";

	let { data } = $props();

	// TODO: Add pagination.
</script>

<div class="flex">
	<div class="ml-3">
		<p class="text-xl m-2 ml-0 font-mono">{m.bland_stock_swan_quiz()}</p>
		<hr />
		<div class="flex mt-2 gap-1">
			{#await data.packs}
				<p>{m.tidy_fancy_mule_prosper()}</p>
			{:then packs}
				{#if packs.length <= 0}
					<p>{m.aloof_true_squid_favor()}</p>
				{/if}

				{#each packs.toSorted((a, b) => b.totalDownloadCount - a.totalDownloadCount) as p (p.id)}
					<PackSmall pack={p} />
				{/each}
			{/await}
		</div>
	</div>

	<div class="border-l ml-auto h-screen"></div>

	<div class="ml-auto mr-3">
		<p class="text-xl m-2 ml-0 font-mono">{m.weak_drab_otter_aspire()}</p>
		<hr />
		<div class="flex flex-col mt-2 gap-1">
			{#await data.cards}
				<p>{m.tidy_fancy_mule_prosper()}</p>
			{:then cards}
				{#if cards.length <= 0}
					<p>{m.aloof_true_squid_favor()}</p>
				{/if}

				{#each cards as c (c.card.id)}
					<CardSmall card={c.card} pack={c.pack} />
				{/each}
			{/await}
		</div>
	</div>
</div>
