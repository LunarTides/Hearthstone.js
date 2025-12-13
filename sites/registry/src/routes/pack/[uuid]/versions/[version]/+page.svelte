<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import PackBig from "$lib/components/pack-big.svelte";
	import type { PackWithExtras } from "$lib/db/schema.js";
	import { m } from "$lib/paraglide/messages";
	import { satisfiesRole } from "$lib/user.js";

	let { data, form } = $props();
	let deleteConfirm = $state(0);

	// Some real typescript magic right here. Wow...
	let packs = $state<Promise<{ current: PackWithExtras; all: PackWithExtras[] }>>(
		Promise.resolve() as any,
	);

	const canEditPack = $derived((ps: Awaited<typeof packs>) => {
		if (!data.user) {
			return false;
		}

		return ps.current.userIds.includes(data.user.id);
	});
	const canModeratePack = $derived(satisfiesRole(data.user, "Moderator"));

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
{:then versions}
	<PackBig
		packs={{
			...versions,
			latest: versions.all.find((v) => v.isLatestVersion)!,
		}}
		cards={{ all: data.cards! }}
		user={data.user}
		{form}
		individual
		class="rounded-b-none"
	/>

	<form action="?/download" method="post" use:enhance>
		{#if form?.message}<p class="text-red-500">{form.message}</p>{/if}
		<button
			type="submit"
			class={`p-3 w-full bg-blue-500 text-white hover:bg-blue-400 hover:cursor-pointer active:bg-blue-600 ${canModeratePack || canEditPack(versions) ? "" : "rounded-b-lg"}`}
		>
			Download
		</button>
	</form>

	{#if canModeratePack || canEditPack(versions)}
		{#if deleteConfirm < 2}
			<button
				class="p-3 w-full rounded-b-lg bg-red-400 text-white hover:bg-red-300 hover:cursor-pointer active:bg-red-500"
				onclick={() => {
					deleteConfirm++;
				}}
			>
				{#if deleteConfirm === 0}
					<p>Delete</p>
				{:else if deleteConfirm === 1}
					<p>Really delete?</p>
				{/if}
			</button>
		{:else}
			<form action="?/delete" method="post" use:enhance>
				{#if form?.message}<p class="text-red-500">{form.message}</p>{/if}
				<button
					type="submit"
					class="p-3 w-full rounded-b-lg bg-red-400 text-white hover:bg-red-300 hover:cursor-pointer active:bg-red-500"
				>
					<p>Really <em>REALLY</em> delete? You cannot undo this action.</p>
				</button>
			</form>
		{/if}
	{/if}
{/await}
