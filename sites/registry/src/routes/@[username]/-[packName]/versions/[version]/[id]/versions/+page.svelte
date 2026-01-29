<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import type { PackWithExtras } from "$lib/db/schema.js";

	let { data } = $props();

	// Some real typescript magic rig/ht here. Wow...
	let packs = $state<
		Promise<{ current: PackWithExtras; latest: PackWithExtras; all: PackWithExtras[] }>
	>(Promise.resolve() as any);

	let versionsOpen = $state(page.url.hash.startsWith("#version"));

	$effect(() => {
		(async () => {
			const ps = await data.packs;
			const found = ps.all.find((v) => v.id === page.params.id);
			if (!found) {
				// TODO: Error handling.
				return;
			}

			packs = Promise.resolve({ current: found, latest: ps.latest, all: ps.all });
		})();
	});
</script>

{#await packs}
	<p>Loading...</p>
{:then versions}
	<!-- Versions -->
	<div class="m-1 p-2 bg-header rounded-md">
		<div class="m-1 flex flex-col gap-2">
			<a
				id="version-latest"
				class="bg-background p-2 text-center rounded-full text-xl text-white target:outline-1"
				href={resolve("/@[username]/-[packName]", {
					username: versions.latest.ownerName,
					packName: versions.latest.name,
				})}
			>
				Latest
				<span class="text-gray-700">({versions.latest.id.split("-").at(-1)!.slice(0, 6)})</span>
			</a>

			<hr class="border" style="border-color: var(--color-background);" />

			{#each versions.all.toSorted( (a, b) => b.packVersion.localeCompare(a.packVersion), ) as pack (pack.id)}
				<a
					id={`version-${pack.id}`}
					href={resolve("/@[username]/-[packName]/versions/[version]/[id]", {
						username: pack.ownerName,
						packName: pack.name,
						version: pack.packVersion,
						id: pack.id,
					})}
					class="bg-background p-2 rounded-full text-xl text-center text-white target:outline-1"
				>
					{pack.packVersion}
					<span class="text-gray-700">({pack.id.split("-").at(-1)!.slice(0, 6)})</span>
				</a>
			{/each}
		</div>
	</div>
{/await}
