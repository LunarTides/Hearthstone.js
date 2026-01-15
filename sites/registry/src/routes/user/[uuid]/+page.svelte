<script lang="ts">
	import PackSmall from "$lib/components/pack-small.svelte";
	import UserBig from "$lib/components/user-big.svelte";
	import semver from "semver";

	let { data } = $props();
</script>

{#await data.currentUser}
	<p>Loading...</p>
{:then user}
	<div class="m-2">
		<UserBig {user} loggedInUser={data.user} />
	</div>

	{#await data.packs}
		<p>Loading...</p>
	{:then packs}
		{#if packs}
			<div class="flex flex-col w-fit gap-1">
				{#each packs.toSorted((a, b) => {
					const ap = a.relevantPacks.at(0);
					if (!ap) {
						return 1;
					}

					const bp = b.relevantPacks.at(0);
					if (!bp) {
						return -1;
					}

					return ap.name.localeCompare(bp.name);
				}) as versions (versions.uuid)}
					{#if versions.relevantPacks.length > 0}
						<div class="flex flex-col p-5 rounded-xl gap-1">
							<p class="m-2 mb-0 text-3xl text-white font-bold">
								{versions.relevantPacks.at(0)?.name ?? ""}
							</p>
							<hr class="border mb-1" />
							<div class="flex bg-background rounded-xl gap-1">
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
									.slice(1) as pack (pack.id)}
									<PackSmall {pack} navigateToVersion />
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
