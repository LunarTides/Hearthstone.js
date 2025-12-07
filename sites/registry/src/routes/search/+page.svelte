<script lang="ts">
	import { resolve } from "$app/paths";

	let { data } = $props();
</script>

{#snippet pack(pack: (typeof data.packs)[0])}
	<div class="w-fit m-2">
		<a href={resolve("/pack/[uuid]", { uuid: pack.uuid })}>
			<div class="bg-blue-300 p-4 rounded-xl w-fit">
				<p class="font-bold">{pack.name} ({pack.gameVersion})</p>
				<p>{pack.description}</p>
			</div>
		</a>
	</div>
{/snippet}

{#if data.packs.length <= 0}
	<p>No results.</p>
{/if}

<div class="flex mt-1">
	{#each data.packs as p (p.uuid)}
		{@render pack(p)}
	{/each}
</div>
