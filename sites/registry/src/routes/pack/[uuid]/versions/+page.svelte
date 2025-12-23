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
			{#each packs.all.toSorted( (a, b) => b.packVersion.localeCompare(a.packVersion), ) as version (version.id)}
				<button
					class="bg-slate-500 p-2 rounded-full text-xl text-white hover:bg-slate-400 hover:cursor-pointer active:bg-slate-600"
					onclick={() => {
						goto(
							resolve("/pack/[uuid]/versions/[version]", {
								uuid: version.uuid,
								version: version.packVersion,
							}),
						);
					}}
				>
					{version.packVersion}
				</button>
			{/each}
		</div>
	{/if}
{/await}
