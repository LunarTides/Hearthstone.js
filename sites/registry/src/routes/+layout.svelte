<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { getLocale, setLocale, locales } from "$lib/paraglide/runtime";

	let { children, data } = $props();

	let searchQuery = $state("");
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="flex items-center p-5 bg-slate-500 text-white space-x-2">
	<a href={resolve("/")} class="font-bold uppercase text-xl">Registry</a>
	<p class="text-4xl font-thin">|</p>

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

	<span class="flex items-center space-x-2 ml-auto">
		{#if data.user}
			<form action="/?/logout" method="post">
				<button type="submit" class="hover:cursor-pointer">Logout</button>
			</form>
		{:else}
			<a href={resolve("/login")}>Login</a>
		{/if}

		<select class="text-black rounded-full">
			{#each locales as locale (locale)}
				<option onclick={() => setLocale(locale)} selected={getLocale() === locale}>
					{locale}
				</option>
			{/each}
		</select>
	</span>
</nav>

{@render children()}
