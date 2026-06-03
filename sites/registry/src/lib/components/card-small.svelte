<script lang="ts">
	import { resolve } from "$app/paths";
	import { getColorFromRarity } from "$lib";
	import type { Resource, PackWithExtras } from "$lib/db/schema";

	let {
		card,
		pack,
	}: {
		card: Resource;
		pack: PackWithExtras;
	} = $props();

	let data = $derived(JSON.parse(card.json));
</script>

<div class="w-fit">
	<a
		href={resolve("/@[username]/-[packName]/v[version]/resources/[uuid]", {
			username: pack.ownerName,
			packName: pack.name,
			version: pack.packVersion,
			uuid: card.uuid,
		})}
	>
		<div
			class="bg-black text-white p-4 rounded-xl transition-all hover:scale-105 hover:drop-shadow-xl hover:bg-slate-900"
		>
			<p>
				<span class="text-cyan-500 font-bold">{`{${data.cost}}`}</span>
				<span style={`color: ${getColorFromRarity(data.rarity)}`}>{card.name}</span>
				<span class="text-yellow-200 font-bold">({data.type})</span>
			</p>
			<p class="font-mono">{data.text}</p>

			<p class="text-amber-700">Classes: {data.classes.join(", ")}</p>
			<p class="text-amber-600">Rarity: {data.rarity}</p>

			{#if data.attack && data.health}
				<p class="text-amber-400">Stats: {data.attack} / {data.health}</p>
			{/if}
			{#if data.tribes}
				<p class="text-amber-200">Tribes: {data.tribes.join(", ") || "None"}</p>
			{/if}
			{#if data.spellSchools}
				<p class="text-amber-400">
					Spell Schools: {data.spellSchools?.join(", ") || "None"}
				</p>
			{/if}
			{#if data.durability}
				<p class="text-amber-400">Durability: {data.durability}</p>
			{/if}
			{#if data.cooldown}
				<p class="text-amber-200">Cooldown: {data.cooldown}</p>
			{/if}
			{#if data.armor}
				<p class="text-amber-400">Armor: {data.armor}</p>
			{/if}
			{#if data.heropowerId}
				<!-- TODO: Add the actual heropower here. -->
				<p class="text-amber-200">Hero Power ID: {data.heropowerId}</p>
			{/if}
			{#if data.enchantmentPriority}
				<p class="text-amber-400">Enchantment Priority: {data.enchantmentPriority}</p>
			{/if}

			<p class="text-xs mt-2">
				From: {pack.name} v{pack.packVersion}, for Version {pack.gameVersion}
			</p>
		</div>
	</a>
</div>
