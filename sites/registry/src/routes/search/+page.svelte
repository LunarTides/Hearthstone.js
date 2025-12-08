<script lang="ts">
	import { resolve } from "$app/paths";

	let { data } = $props();
</script>

{#snippet pack(pack: (typeof data.packs)[0])}
	<div class="w-fit">
		<a href={resolve("/pack/[uuid]", { uuid: pack.uuid })}>
			<div class="bg-blue-300 p-4 rounded-xl w-fit">
				<p class="font-bold">{pack.name} ({pack.gameVersion})</p>
				<p>{pack.description}</p>
			</div>
		</a>
	</div>
{/snippet}

{#snippet card(card: (typeof data.cards)[0])}
	<div class="w-fit">
		<a href={resolve("/card/[uuid]", { uuid: card.uuid })}>
			<div class="bg-blue-300 p-4 rounded-xl w-fit">
				<p class="font-bold">{card.name} ({card.type})</p>
				<p>{card.text}</p>
			</div>
		</a>
	</div>
{/snippet}

{#if data.packs.length <= 0 && data.cards.length <= 0}
	<p>No results.</p>
{/if}

<div class="flex">
	<div class="ml-3">
		<p class="text-xl m-2 ml-0 font-mono">Packs</p>
		<hr />
		<div class="flex mt-2">
			{#each data.packs as p (p.uuid)}
				{@render pack(p)}
			{/each}
		</div>
	</div>

	<div class="border ml-auto h-screen"></div>

	<div class="ml-auto mr-3">
		<p class="text-xl m-2 ml-0 font-mono">Cards</p>
		<hr />
		<div class="flex mt-2">
			{#each data.cards as c (c.uuid)}
				{@render card(c)}
			{/each}
		</div>
	</div>
</div>
