<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { getLocale, setLocale, locales } from "$lib/paraglide/runtime";
	import { m } from "$lib/paraglide/messages.js";

	let { children, data } = $props();

	let searchQuery = $state("");
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="flex items-center p-5 bg-slate-500 text-white space-x-2">
	<a href={resolve("/")} class="font-bold uppercase text-xl">{m.bald_trite_myna_pet()}</a>
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
			placeholder={m.acidic_seemly_marmot_peel()}
			bind:value={searchQuery}
			class="text-black rounded-full"
		/>
	</form>

	{#if data.user}
		<a href={resolve("/upload")}>{m.inclusive_quaint_butterfly_push()}</a>
	{/if}

	<span class="flex items-center space-x-2 ml-auto">
		{#if data.user}
			<form action="/?/logout" method="post">
				<button type="submit" class="hover:cursor-pointer">{m.loose_drab_warthog_cut()}</button>
			</form>
		{:else}
			<a href={resolve("/login")}>{m.muddy_fluffy_gibbon_prosper()}</a>
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
