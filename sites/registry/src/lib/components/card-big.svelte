<script lang="ts">
	import { getColorFromRarity } from "$lib";
	import type { Card, PackWithExtras } from "$lib/db/schema";

	let {
		card,
		pack,
	}: {
		card: Card;
		pack: PackWithExtras;
	} = $props();
</script>

<div class="bg-black text-white p-4 rounded-xl m-1">
	<div class="flex flex-col">
		<p class="">
			<span class="text-cyan-500 font-bold">{`{${card.cost}}`}</span>
			<span style={`color: ${getColorFromRarity("Legendary")}`}>{card.name}</span>
			<span class="text-yellow-200 font-bold">({card.type})</span>
			{#if !pack.isLatestVersion}
				<span class="text-gray-600">(v{pack.packVersion})</span>
			{/if}
		</p>
		<p class="font-mono">{card.text}</p>

		<p class="text-amber-700">Classes: {card.classes.join(", ")}</p>
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

		<p class="text-xs mt-2">
			From: {pack.name} v{pack.packVersion}, for Version {pack.gameVersion}
		</p>
	</div>
</div>
