<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import PackSmall from "$lib/components/pack-small.svelte";

	let { data } = $props();
</script>

{#if page.params.username === data.user?.username}
	<a href={resolve("/upload")} class="underline ml-2">Upload a Pack</a>
{/if}

{#await data.packs}
	<p>Loading...</p>
{:then packs}
	{#if packs}
		<div class="flex flex-col w-fit gap-1">
			{#each packs as versions (versions.uuid)}
				{#if versions.relevantPacks.length > 0}
					<div class="flex flex-col p-2 rounded-xl gap-1">
						<p class="m-2 mb-0 text-3xl text-white font-bold">
							{versions.relevantPacks.at(0)?.name ?? ""}
						</p>
						<hr class="border mb-1" />
						<div class="flex bg-background rounded-xl gap-1">
							<!-- Latest version -->
							<PackSmall
								pack={versions.relevantPacks[0]}
								clientUser={data.user}
								navigateToVersion
							/>

							<div class="border-l-2 mx-2 h-auto"></div>

							<!-- Other versions -->
							<div class="flex flex-wrap gap-1">
								{#each versions.relevantPacks.slice(1) as pack (pack.id)}
									<PackSmall {pack} clientUser={data.user} navigateToVersion />
								{/each}
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
{/await}
