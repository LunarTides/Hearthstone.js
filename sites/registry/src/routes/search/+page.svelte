<script lang="ts">
	import PackSmall from "$lib/components/pack-small.svelte";
	import ResourceSmall from "$lib/components/resource-small.svelte";

	let { data } = $props();

	// TODO: Add pagination.
</script>

<div class="flex">
	<div class="ml-3">
		<p class="text-xl m-2 ml-0 border-b text-center">Packs</p>
		<div class="flex mt-2 gap-1">
			{#await data.packs}
				<p>Loading...</p>
			{:then packs}
				{#if packs.length <= 0}
					<p>No results.</p>
				{/if}

				<div class="flex flex-wrap gap-1 mr-1">
					{#each packs.toSorted((a, b) => b.totalDownloadCount - a.totalDownloadCount) as p (p.id)}
						<PackSmall pack={p} clientUser={data.user} />
					{/each}
				</div>
			{/await}
		</div>
	</div>

	<div class="mr-3">
		<p class="text-xl m-2 ml-0 border-b text-center">Resources</p>
		<div class="flex flex-col mt-2 gap-1">
			{#await data.resources}
				<p>Loading...</p>
			{:then resources}
				{#if resources.length <= 0}
					<p>No results.</p>
				{/if}

				<div class="flex flex-wrap gap-1 ml-1">
					{#each resources as r (r.resource.id)}
						<ResourceSmall resource={r.resource} pack={r.pack} />
					{/each}
				</div>
			{/await}
		</div>
	</div>
</div>
