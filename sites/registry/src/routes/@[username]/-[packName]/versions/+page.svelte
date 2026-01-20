<script lang="ts">
	import { resolve } from "$app/paths";
	import PackBig from "$lib/components/pack-big.svelte";

	let { data, form } = $props();
</script>

{#await data.packs}
	<p>Loading...</p>
{:then packs}
	{#if packs}
		<PackBig
			{packs}
			cards={{ all: data.latestCards! }}
			user={data.user}
			{form}
			class="rounded-b-none"
		/>

		<div class="p-2 flex flex-col gap-2">
			<a
				class="bg-header p-2 text-center rounded-full text-xl text-white"
				href={resolve("/@[username]/-[packName]/versions/all", {
					username: packs.latest.ownerName,
					packName: packs.latest.name,
				})}
			>
				All
			</a>

			<hr class="border" style="border-color: var(--color-header);" />

			{#each packs.all.toSorted( (a, b) => b.packVersion.localeCompare(a.packVersion), ) as pack (pack.id)}
				<a
					href={resolve("/@[username]/-[packName]/versions/[version]/[id]", {
						username: pack.ownerName,
						packName: pack.name,
						version: pack.packVersion,
						id: pack.id,
					})}
					class="bg-header p-2 rounded-full text-xl text-center text-white"
				>
					{pack.packVersion}
					<span class="text-gray-700">({pack.id.split("-").at(-1)!.slice(0, 6)})</span>
				</a>
			{/each}
		</div>
	{/if}
{/await}
