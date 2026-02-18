<script lang="ts">
	import { resolve } from "$app/paths";

	let { data } = $props();
</script>

{#await data.formattedPacks}
	<p>Loading...</p>
{:then packs}
	<!-- Versions -->
	<div class="m-1 p-2 bg-header rounded-md">
		<div class="m-1 flex flex-col gap-2">
			<a
				id="version-latest"
				class="bg-background p-2 text-center rounded-full text-xl text-white target:outline-1"
				href={resolve("/@[username]/-[packName]", {
					username: packs.latest.ownerName,
					packName: packs.latest.name,
				})}
			>
				Latest
				<span class="text-gray-700">({packs.latest.id.split("-").at(-1)!.slice(0, 6)})</span>
			</a>

			<hr class="border" style="border-color: var(--color-background);" />

			{#each packs.all.toSorted( (a, b) => b.packVersion.localeCompare(a.packVersion), ) as pack (pack.id)}
				<a
					id={`version-${pack.id}`}
					href={resolve("/@[username]/-[packName]/v[version]/[id]", {
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
