<script lang="ts">
	import { resolve } from "$app/paths";
	import { m } from "$lib/paraglide/messages.js";

	let { data } = $props();
</script>

<div class="flex">
	<div class="ml-3">
		<p class="text-xl m-2 ml-0 font-mono">{m.bland_stock_swan_quiz()}</p>
		<hr />
		<div class="flex mt-2">
			{#await data.packs}
				<p>{m.tidy_fancy_mule_prosper()}</p>
			{:then packs}
				{#if packs.length <= 0}
					<p>{m.aloof_true_squid_favor()}</p>
				{/if}

				{#snippet pack(pack: (typeof packs)[0])}
					<div class="w-fit">
						<a href={resolve("/pack/[uuid]", { uuid: pack.uuid })}>
							<div class="bg-blue-300 p-4 rounded-xl w-fit">
								<p class="font-bold">{pack.name} ({pack.gameVersion})</p>
								<p>{pack.description}</p>
							</div>
						</a>
					</div>
				{/snippet}

				{#each packs as p (p.uuid)}
					{@render pack(p)}
				{/each}
			{/await}
		</div>
	</div>

	<div class="border ml-auto h-screen"></div>

	<div class="ml-auto mr-3">
		<p class="text-xl m-2 ml-0 font-mono">{m.weak_drab_otter_aspire()}</p>
		<hr />
		<div class="flex mt-2">
			{#await data.cards}
				<p>{m.tidy_fancy_mule_prosper()}</p>
			{:then cards}
				{#if cards.length <= 0}
					<p>{m.aloof_true_squid_favor()}</p>
				{/if}

				{#snippet card(card: (typeof cards)[0])}
					<div class="w-fit">
						<a href={resolve("/card/[uuid]", { uuid: card.uuid })}>
							<div class="bg-blue-300 p-4 rounded-xl w-fit">
								<p class="font-bold">{card.name} ({card.type})</p>
								<p>{card.text}</p>
							</div>
						</a>
					</div>
				{/snippet}

				{#each cards as c (c.uuid)}
					{@render card(c)}
				{/each}
			{/await}
		</div>
	</div>
</div>
