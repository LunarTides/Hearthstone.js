<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import PackBig from "$lib/components/pack-big.svelte";
	import { m } from "$lib/paraglide/messages";

	let { data, form } = $props();

	// Some real typescript magic right here. Wow...
	type PacksData = Awaited<typeof data.packs>["latest"];
	let version = $state<Promise<PacksData>>(Promise.resolve() as any);

	$effect(() => {
		(async () => {
			const packs = await data.packs;
			const found = packs.all.find((v) => v.packVersion === page.params.version);

			version = Promise.resolve(found as any);
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

{#await version}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then version}
	<PackBig pack={version} user={data.user} hideButtons />

	<form action="?/download" method="post" use:enhance>
		{#if form?.message}<p class="text-red-500">{form.message}</p>{/if}
		<button
			type="submit"
			class="m-2 p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-400 hover:cursor-pointer active:bg-blue-600"
		>
			Download
		</button>
	</form>
{/await}
