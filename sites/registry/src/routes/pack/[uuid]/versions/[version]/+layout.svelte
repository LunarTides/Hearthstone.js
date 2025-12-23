<script lang="ts">
	import { page } from "$app/state";
	import PackBig from "$lib/components/pack-big.svelte";
	import type { PackWithExtras } from "$lib/db/schema.js";

	let { data, form, children } = $props();

	// Some real typescript magic right here. Wow...
	let packs = $state<Promise<{ current: PackWithExtras; all: PackWithExtras[] }>>(
		Promise.resolve() as any,
	);

	$effect(() => {
		(async () => {
			const ps = await data.packs!;
			const found = ps.all.find((v) => v.packVersion === page.params.version);
			if (!found) {
				// TODO: Error handling.
				return;
			}

			packs = Promise.resolve({ current: found, all: ps.all });
		})();
	});
</script>

{#await packs}
	<p>Loading...</p>
{:then versions}
	<PackBig
		packs={{
			...versions,
			latest: versions.all.find((v) => v.isLatestVersion)!,
		}}
		cards={{ all: data.cards! }}
		user={data.user}
		{form}
		showDownloadButton
		deleteButtonBuiltin
		individual
		class="rounded-b-none"
	/>
{/await}

{@render children()}
