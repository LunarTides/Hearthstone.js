<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { type Card, type PackWithExtras } from "$lib/db/schema";

	let {
		card,
		cardsAll,
		pack,
		packsAll,
	}: {
		card: Card;
		cardsAll: Card[];
		pack: PackWithExtras;
		packsAll: PackWithExtras[];
	} = $props();
</script>

<div class="bg-black text-white p-4 rounded-t-none rounded-xl">
	<div
		class="flex float-right m-2 mt-4 w-fit h-fit text-black bg-blue-300 drop-shadow-2xl rounded-full outline-1 outline-black"
	>
		{#if page.route.id === "/card/[uuid]/versions"}
			<p class="px-5 py-3 rounded-full bg-gray-300 hover:cursor-default">
				Versions ({cardsAll.length})
			</p>
		{:else}
			<a
				href={resolve("/card/[uuid]/versions", { uuid: page.params.uuid! })}
				class="px-5 py-3 rounded-full hover:bg-cyan-200 active:bg-blue-400"
			>
				Versions ({cardsAll.length})
			</a>
		{/if}
	</div>

	<div class="flex flex-col">
		<p class="">
			<span class="text-cyan-500 font-bold">{`{${card.cost}}`}</span>
			<!-- TODO: Color by rarity. -->
			<span class="text-white">{card.name}</span>
			<span class="text-yellow-200 font-bold">({card.type})</span>
			{#if !pack.isLatestVersion}
				<span class="text-gray-600">(v{pack.packVersion})</span>
			{/if}
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
</div>
