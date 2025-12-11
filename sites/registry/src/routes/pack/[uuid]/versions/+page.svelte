<script lang="ts">
	import { resolve } from "$app/paths";
	import { m } from "$lib/paraglide/messages.js";
	import { goto } from "$app/navigation";

	let { data } = $props();
</script>

{#await data.packs}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then packs}
	<div class="p-2 flex flex-col space-y-2">
		{#each packs.all as version (version.id)}
			<button
				class="bg-blue-500 p-2 rounded-full text-xl text-white hover:bg-blue-400 hover:cursor-pointer active:bg-blue-600"
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
{/await}
