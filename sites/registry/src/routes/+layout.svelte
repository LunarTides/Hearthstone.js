<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { goto } from "$app/navigation";

	let { children, data } = $props();

	let searchQuery = $state("");
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="flex items-center p-5 bg-slate-500 text-white space-x-2">
	<a href="/" class="font-bold uppercase text-xl">Registry</a>
	<p class="text-4xl font-thin">|</p>

	<form
		onsubmit={(event) => {
			event.preventDefault();

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
	<!-- <a href="/search">Search</a> -->

	{#if data.user}
		<a href="/upload">Upload</a>
	{/if}

	<span class="ml-auto">
		{#if data.user}
			<form action="/?/logout" method="post">
				<button type="submit" class="hover:cursor-pointer">Logout</button>
			</form>
		{:else}
			<a href="/login">Login</a>
		{/if}
	</span>
</nav>

{@render children()}
