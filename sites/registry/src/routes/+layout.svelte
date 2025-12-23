<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { githubDarkDimmed } from "svelte-highlight/styles";
	import { enhance } from "$app/forms";

	let { children, data } = $props();

	let searchQuery = $state("");
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html githubDarkDimmed}
</svelte:head>

<nav class="flex items-center p-5 bg-slate-500 text-white gap-2">
	<a href={resolve("/")} class="font-bold uppercase text-xl">Registry</a>
	<p class="text-4xl font-thin">|</p>

	<!-- TODO: Use superforms. -->
	<form
		onsubmit={(event) => {
			event.preventDefault();

			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(`/search?q=${searchQuery}`);
		}}
	>
		<input
			type="text"
			placeholder="Search..."
			bind:value={searchQuery}
			class="text-black rounded-full"
		/>
	</form>

	{#if data.user}
		<a href={resolve("/upload")}>Upload</a>
	{/if}

	<span class="flex items-center gap-2 ml-auto">
		{#if data.user}
			<!-- TODO: Use superforms. -->
			<form action="/?/logout" method="post" use:enhance>
				<button type="submit" class="hover:cursor-pointer">Logout</button>
			</form>
		{:else}
			<a href={resolve("/login")}>Login</a>
		{/if}

		{#if data.user}
			<a
				href={resolve("/user/[uuid]", { uuid: data.user.id })}
				class="p-5 bg-white rounded-full"
				title="Profile"
			></a>
		{/if}
	</span>
</nav>

{@render children()}
