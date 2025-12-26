<script lang="ts">
	import { enhance } from "$app/forms";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import PackBig from "$lib/components/pack-big.svelte";
	import type { PackWithExtras } from "$lib/db/schema.js";
	import { satisfiesRole } from "$lib/user";

	let { data, form, children } = $props();

	// Some real typescript magic right here. Wow...
	let packs = $state<Promise<{ current: PackWithExtras; all: PackWithExtras[] }>>(
		Promise.resolve() as any,
	);

	let canEditPack = $state(false);
	const canModeratePack = $derived(satisfiesRole(data.user, "Moderator"));

	let approveConfirm = $state(0);
	let deleteConfirm = $state(0);

	$effect(() => {
		(async () => {
			const ps = await data.packs!;
			const found = ps.all.find((v) => v.packVersion === page.params.version);
			if (!found) {
				// TODO: Error handling.
				return;
			}

			packs = Promise.resolve({ current: found, all: ps.all });
			canEditPack = found.userIds.includes(data.user?.id || "0");
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
		individual
		class="rounded-b-none"
	/>

	{#if canEditPack || canModeratePack}
		<div class="flex text-white">
			<a
				href={resolve("/pack/[uuid]/edit", { uuid: versions.current.uuid })}
				class="px-5 py-3 w-full text-center bg-red-400 hover:bg-red-300 active:bg-red-500"
			>
				Edit
			</a>
			<div class="border-l text-slate-700 ml-auto h-auto"></div>
			{#if deleteConfirm < 2}
				<button
					class="px-5 py-3 w-full hover:cursor-pointer bg-red-400 hover:bg-red-300 active:bg-red-500"
					onclick={() => {
						deleteConfirm++;
					}}
				>
					{#if deleteConfirm === 0}
						Delete Version
					{:else if deleteConfirm === 1}
						Really delete?
					{/if}
				</button>
			{:else}
				<!-- TODO: Use superforms. -->
				<form
					action={resolve("/pack/[uuid]/versions/[version]", {
						uuid: versions.current.uuid,
						version: versions.current.packVersion,
					}) + "?/delete"}
					method="post"
					class="w-full"
					use:enhance
				>
					{#if form?.message}<p class="text-red-500">{form.message}</p>{/if}
					<button
						type="submit"
						class="px-5 py-3 w-full bg-red-500 hover:cursor-pointer hover:bg-red-400 active:bg-red-600"
					>
						<p>Really <em>REALLY</em> delete? You cannot undo this action.</p>
					</button>
				</form>
			{/if}
		</div>
	{/if}

	{#if canModeratePack}
		<div class="flex bg-black text-white outline-1 -outline-offset-1">
			<!-- Approve -->
			{#if approveConfirm === 0}
				<button
					class="px-5 py-3 w-full rounded-l-full hover:cursor-pointer hover:bg-gray-800 active:bg-black"
					onclick={() => approveConfirm++}
				>
					Approve
				</button>
			{:else}
				<form
					action={resolve("/pack/[uuid]/versions/[version]", {
						uuid: versions.current.uuid,
						version: versions.current.packVersion,
					}) + "?/approve"}
					method="post"
					class="w-full"
					use:enhance
				>
					{#if form?.message}<p class="text-red-500">{form.message}</p>{/if}
					<button
						type="submit"
						class="px-5 py-3 w-full text-center rounded-l-full hover:cursor-pointer hover:bg-gray-800 active:bg-black"
					>
						Are you sure?
					</button>
				</form>
			{/if}
		</div>
	{/if}
{/await}

{@render children()}
