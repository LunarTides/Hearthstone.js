<script lang="ts">
	import { resolve } from "$app/paths";

	let { form } = $props();
</script>

<p>Search</p>

<form method="post" enctype="multipart/form-data">
	<input name="query" type="text" />
	<button type="submit">Search</button>
</form>

{#if form}
	{#snippet pack(pack: (typeof form.packs)[0])}
		<!-- <pre>{JSON.stringify(pack, null, 4)}</pre> -->

		<div class="w-fit m-2">
			<a href={resolve("/pack/[uuid]", { uuid: pack.uuid })}>
				<div class="bg-blue-300 p-4 rounded-xl w-fit">
					<p class="font-bold">{pack.name} ({pack.gameVersion})</p>
					<p>{pack.description}</p>
				</div>
			</a>
		</div>
	{/snippet}

	<div class="flex">
		{#each form?.packs as p (p.uuid)}
			{@render pack(p)}
		{/each}
	</div>
{/if}
