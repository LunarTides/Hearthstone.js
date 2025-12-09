<script lang="ts">
	import { resolve } from "$app/paths";
	import cardboard from "$lib/assets/cardboard-texture.avif";
	import { m } from "$lib/paraglide/messages.js";

	let { data } = $props();

	// TODO: Add pagination.
</script>

<div class="flex">
	<div class="ml-3">
		<p class="text-xl m-2 ml-0 font-mono">{m.bland_stock_swan_quiz()}</p>
		<hr />
		<div class="flex mt-2 space-x-1 space-y-1">
			{#await data.packs}
				<p>{m.tidy_fancy_mule_prosper()}</p>
			{:then packs}
				{#if packs.length <= 0}
					<p>{m.aloof_true_squid_favor()}</p>
				{/if}

				{#snippet pack(pack: (typeof packs)[0])}
					<div class="w-fit">
						<a href={resolve("/pack/[uuid]", { uuid: pack.uuid })}>
							<div
								class="text-white p-4 rounded-xl w-fit bg-cover transition-all bg-gray-300 bg-blend-multiply hover:scale-105 hover:my-1 hover:drop-shadow-xl"
								style={`background-image: url(${cardboard})`}
							>
								<p class="font-bold">{pack.name} ({pack.packVersion})</p>
								<p class="text-xs mb-2">{pack.authors.join(", ")}</p>
								<p>{pack.description}</p>
								<p class="font-mono">({pack.license} | {pack.gameVersion})</p>
							</div>
						</a>
					</div>
				{/snippet}

				{#each packs as p (p.id)}
					{@render pack(p)}
				{/each}
			{/await}
		</div>
	</div>

	<div class="border-l ml-auto h-screen"></div>

	<div class="ml-auto mr-3">
		<p class="text-xl m-2 ml-0 font-mono">{m.weak_drab_otter_aspire()}</p>
		<hr />
		<div class="flex flex-col mt-2 space-x-1 space-y-1">
			{#await data.cards}
				<p>{m.tidy_fancy_mule_prosper()}</p>
			{:then cards}
				{#if cards.length <= 0}
					<p>{m.aloof_true_squid_favor()}</p>
				{/if}

				{#snippet card({ card, pack }: (typeof cards)[0])}
					<div class="w-fit">
						<a href={resolve("/card/[uuid]", { uuid: card.uuid })}>
							<div
								class="bg-black text-white p-4 rounded-xl w-fit transition-all hover:scale-105 hover:my-1 hover:drop-shadow-xl"
							>
								<p class="">
									<span class="text-cyan-500 font-bold">{`{${card.cost}}`}</span>
									<!-- TODO: Color by rarity. -->
									<span class="text-white">{card.name}</span>
									<span class="text-yellow-200 font-bold">({card.type})</span>
								</p>
								<p class="font-mono">{card.text}</p>

								<p class="text-amber-700">Classes: {card.classes.join(", ")}</p>
								<!-- TODO: Color by rarity. -->
								<p class="text-amber-600">Rarity: {card.rarity}</p>

								{#if card.attack && card.health}
									<p class="text-amber-400">Stats: {card.attack} / {card.health}</p>
								{/if}
								{#if card.tribes}
									<p class="text-amber-200">Tribes: {card.tribes.join(", ") || "None"}</p>
								{/if}
								{#if card.spellSchools}
									<p class="text-amber-400">
										Spell Schools: {card.spellSchools?.join(", ") || "None"}
									</p>
								{/if}
								{#if card.durability}
									<p class="text-amber-400">Durability: {card.durability}</p>
								{/if}
								{#if card.cooldown}
									<p class="text-amber-200">Cooldown: {card.cooldown}</p>
								{/if}
								{#if card.armor}
									<p class="text-amber-400">Armor: {card.armor}</p>
								{/if}
								{#if card.heropowerId}
									<!-- TODO: Add the actual heropower here. -->
									<p class="text-amber-200">Hero Power ID: {card.heropowerId}</p>
								{/if}
								{#if card.enchantmentPriority}
									<p class="text-amber-400">Enchantment Priority: {card.enchantmentPriority}</p>
								{/if}

								<!-- TODO: Add translation to the entire file. -->
								<p class="text-xs mt-2">
									From: {pack.name} v{pack.packVersion}, for Version {pack.gameVersion}
								</p>
							</div>
						</a>
					</div>
				{/snippet}

				{#each cards as c (c.card.id)}
					{@render card(c)}
				{/each}
			{/await}
		</div>
	</div>
</div>
