<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { m } from "$lib/paraglide/messages";

	let { data } = $props();

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
</script>

<p>{page.params.version}</p>

{#await version}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then version}
	<pre>{JSON.stringify(version, null, 4)}</pre>

	<form
		action={resolve("/api/pack/[uuid]/[version]/download", {
			uuid: version.uuid,
			version: version.id,
		})}
		method="post"
	>
		<button
			type="submit"
			class="m-2 p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-400 hover:cursor-pointer active:bg-blue-600"
			>Download</button
		>
	</form>
{/await}
