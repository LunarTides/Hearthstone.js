<script lang="ts">
	import PackSmall from "$lib/components/pack-small.svelte";

	let { data } = $props();
</script>

{#await data.packs}
	<p>Loading...</p>
{:then packs}
	{#if packs}
		<div class="flex gap-1 pl-2">
			{#each packs as pack (pack.name)}
				<PackSmall pack={pack.versions.latest} clientUser={data.user} navigateToVersion />
			{/each}
		</div>
	{/if}
{/await}
