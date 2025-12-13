<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import PackBig from "$lib/components/pack-big.svelte";
	import type { PackWithExtras } from "$lib/db/schema.js";
	import { m } from "$lib/paraglide/messages";

	let { data, form } = $props();

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

	$effect(() => {
		// Download the file.
		if (form?.file) {
			const element = document.createElement("a");
			element.href = window.URL.createObjectURL(new Blob([form.file]));
			element.download = form.filename;
			element.click();
		}
	});
</script>

{#await packs}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then version}
	<PackBig
		pack={version.current}
		all={version.all}
		cards={data.cards!}
		user={data.user}
		{form}
		class="rounded-b-none"
	/>

	<form action="?/download" method="post" use:enhance>
		{#if form?.message}<p class="text-red-500">{form.message}</p>{/if}
		<button
			type="submit"
			class="p-3 w-full rounded-b-lg bg-blue-500 text-white hover:bg-blue-400 hover:cursor-pointer active:bg-blue-600"
		>
			Download
		</button>
	</form>
{/await}
