<script lang="ts">
	import { enhance } from "$app/forms";
	import PackBig from "$lib/components/pack-big.svelte";

	let { data, form } = $props();

	let deleteConfirm = $state(0);
</script>

{#await data.packs}
	<p>Loading...</p>
{:then packs}
	<PackBig
		{packs}
		cards={{ all: data.cards! }}
		user={data.user}
		{form}
		class={deleteConfirm < 2 ? "rounded-b-none" : ""}
	/>

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
		<form method="post" use:enhance>
			<button
				type="submit"
				class="p-5 w-full text-xl right-0 bottom-0 absolute rounded-t-lg bg-red-500 text-white hover:animate-pulse hover:cursor-pointer active:animate-none active:bg-red-600"
			>
				<p>Really <em>REALLY</em> delete? You cannot undo this action.</p>
			</button>
		</form>
	{/if}
{/await}
