<script lang="ts">
	import { resolve } from "$app/paths";
	import { goto } from "$app/navigation";
	import PackBig from "$lib/components/pack-big.svelte";

	let { data, form } = $props();
</script>

{#await data.packs}
	<p>Loading...</p>
{:then packs}
	{#if packs}
		<PackBig {packs} cards={{ all: data.cards! }} user={data.user} {form} class="rounded-b-none" />

		<div class="p-2 flex flex-col gap-2">
			<a
				class="bg-header p-2 text-center rounded-full text-xl text-white"
				href={resolve("/pack/[uuid]/versions/all", {
					uuid: packs.latest.uuid,
				})}
			>
				All
			</a>

			<hr class="border" style="border-color: var(--color-header);" />

			{#each packs.all.toSorted( (a, b) => b.packVersion.localeCompare(a.packVersion), ) as version (version.id)}
				<a
					href={resolve("/pack/[uuid]/versions/[version]/[id]", {
						uuid: version.uuid,
						version: version.packVersion,
						id: version.id,
					})}
					class="bg-header p-2 rounded-full text-xl text-center text-white"
				>
					{version.packVersion}
					<span class="text-gray-700">({version.id.slice(0, 6)})</span>
				</a>
			{/each}
		</div>
	{/if}
{/await}
