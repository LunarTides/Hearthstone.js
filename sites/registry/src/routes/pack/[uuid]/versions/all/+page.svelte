<script lang="ts">
	import { enhance } from "$app/forms";
	import PackBig from "$lib/components/pack-big.svelte";
	import { satisfiesRole } from "$lib/user.js";

	let { data, form } = $props();

	// Some real typescript magic right here. Wow...
	let packs = $state<typeof data.packs>(Promise.resolve() as any);

	let canEditPack = $state(false);
	const canModeratePack = $derived(satisfiesRole(data.user, "Moderator"));

	let deleteConfirm = $state(0);

	$effect(() => {
		(async () => {
			const ps = await data.packs;
			packs = Promise.resolve(ps);
			canEditPack = ps.latest.userIds.includes(data.user?.id || "0");
		})();
	});
</script>

{#await packs}
	<p>Loading...</p>
{:then packs}
	<PackBig
		{packs}
		cards={{ all: data.cards! }}
		user={data.user}
		{form}
		class={deleteConfirm < 2 ? "rounded-b-none" : ""}
	/>

	{#if canEditPack || canModeratePack}
		{#if deleteConfirm < 2}
			<button
				class="p-3 w-full rounded-b-lg bg-red-400 text-white hover:bg-red-300 hover:cursor-pointer active:bg-red-500"
				onclick={() => deleteConfirm++}
			>
				{#if deleteConfirm === 0}
					Delete
				{:else if deleteConfirm === 1}
					Really delete?
				{/if}
			</button>
		{:else}
			<!-- TODO: Use superforms. -->
			<form action="?/delete" method="post" use:enhance>
				<button
					type="submit"
					class="p-5 w-full text-xl right-0 bottom-0 absolute rounded-t-lg bg-red-500 text-white hover:animate-pulse hover:cursor-pointer active:animate-none active:bg-red-600"
				>
					<p>Really <em>REALLY</em> delete? You cannot undo this action.</p>
				</button>
			</form>
		{/if}
	{/if}
{/await}
