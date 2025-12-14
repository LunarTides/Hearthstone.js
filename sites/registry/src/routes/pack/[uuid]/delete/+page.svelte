<script lang="ts">
	import { resolve } from "$app/paths";
	import { m } from "$lib/paraglide/messages.js";
	import PackBig from "$lib/components/pack-big.svelte";

	let { data, form } = $props();
</script>

<!-- TODO: Deduplicate from `pack/[uuid]/versions/+page.svelte` -->
{#await data.packs}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then packs}
	{#if packs}
		<PackBig {packs} cards={{ all: data.cards! }} user={data.user} {form} class="rounded-b-none" />

		<div class="p-2 flex flex-col gap-2">
			<a
				class="bg-slate-500 p-2 text-center rounded-full text-xl text-white hover:bg-slate-400 active:bg-slate-600"
				href={resolve("/pack/[uuid]/delete/all", {
					uuid: packs.latest.uuid,
				})}
			>
				All
			</a>

			<hr class="border border-slate-400" />

			{#each packs.all.toSorted( (a, b) => b.packVersion.localeCompare(a.packVersion), ) as version (version.id)}
				<a
					class="bg-slate-500 p-2 text-center rounded-full text-xl text-white hover:bg-slate-400 active:bg-slate-600"
					href={resolve("/pack/[uuid]/versions/[version]", {
						uuid: version.uuid,
						version: version.packVersion,
					})}
				>
					{version.packVersion}
				</a>
			{/each}
		</div>
	{/if}
{/await}
