<script lang="ts">
	import PackSmall from "$lib/components/pack-small.svelte";
	import UserSmall from "$lib/components/user-small.svelte";
	import { m } from "$lib/paraglide/messages.js";
	import semver from "semver";

	let { data } = $props();
</script>

{#await data.currentUser}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then user}
	<div class="m-2">
		<UserSmall {user} loggedInUser={data.user} />
	</div>

	{#await data.packs}
		<p>{m.tidy_fancy_mule_prosper()}</p>
	{:then packs}
		{#if packs}
			<div class="m-2 flex flex-col w-fit gap-1">
				{#each packs.toSorted((a, b) => a.relevantPacks
							.at(0)
							?.name.localeCompare(b.relevantPacks.at(0)?.name ?? "") ?? 0) as versions (versions.uuid)}
					{#if versions.relevantPacks.length > 0}
						<div class="flex flex-col p-5 bg-slate-700 rounded-xl gap-1">
							<p class="m-2 mb-0 text-3xl text-white font-bold">
								{versions.relevantPacks.at(0)?.name ?? ""}
							</p>
							<hr class="border mb-1" />
							<div class="flex bg-slate-700 rounded-xl gap-1">
								<!-- Latest version -->
								<PackSmall
									pack={versions.relevantPacks.toSorted((a, b) =>
										semver.compare(b.packVersion, a.packVersion),
									)[0]}
								/>

								<div class="border-l-2 mx-2 h-auto"></div>

								<!-- Other versions -->
								{#each versions.relevantPacks
									.toSorted((a, b) => semver.compare(b.packVersion, a.packVersion))
									.slice(1) as version (version.id)}
									<PackSmall pack={version} navigateToVersion />
								{/each}
							</div>
						</div>
					{/if}
				{/each}
			</div>

			<!-- <pre>{JSON.stringify(packs, null, 4)}</pre> -->
		{/if}
	{/await}

	<!-- <pre>{JSON.stringify(user, null, 4)}</pre> -->
{/await}
