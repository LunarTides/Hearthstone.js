<script lang="ts">
	import { resolve } from "$app/paths";
	import { type Card, type PackWithExtras } from "$lib/db/schema";

	let {
		card,
		pack,
	}: {
		card: Card;
		pack: PackWithExtras;
	} = $props();
</script>

<div class="w-fit">
	<a href={resolve("/card/[uuid]", { uuid: card.uuid })}>
		<div
			class="bg-black text-white p-4 rounded-xl transition-all hover:scale-105 hover:drop-shadow-2xl hover:bg-slate-900"
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
