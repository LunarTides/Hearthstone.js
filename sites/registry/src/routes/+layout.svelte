<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.png";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { githubDarkDimmed } from "svelte-highlight/styles";
	import { enhance } from "$app/forms";
	import { satisfiesRole } from "$lib/user.js";
	import { ArrowLeft, Bell, BellDot, Search } from "lucide-svelte";
	import { PUBLIC_DOMAIN } from "$env/static/public";
	import { page } from "$app/state";

	let { children, data } = $props();

	let smallSearchElement = $state<Element>();
	let smallSearchActive = $state(false);
	let searchForm = $state<HTMLFormElement>();
	let searchQuery = $state("");

	const avatarPromise = import(`$lib/../../static/avatars/${data.user?.username}.avif`).catch(
		() => {},
	);
</script>

<svelte:head>
	<title>Registry | Hearthstone.js</title>
	<link rel="icon" href={favicon} />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html githubDarkDimmed}
</svelte:head>

<nav class="flex items-center p-3 text-white gap-2" style="background-color: var(--color-header);">
	<!-- {#if PUBLIC_DOMAIN !== "http://localhost"} -->
	<a href={PUBLIC_DOMAIN}>
		<ArrowLeft />
	</a>

	<p class="text-4xl font-thin text-gray-600">|</p>
	<!-- {/if} -->

	<a href={resolve("/")} class="font-bold uppercase text-xl overflow-hidden min-w-3">Registry</a>
	<p class="text-4xl font-thin text-gray-600">|</p>

	<!-- TODO: Use superforms. -->
	<form
		bind:this={searchForm}
		onsubmit={(event) => {
			event.preventDefault();

			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(resolve("/search") + `?q=${searchQuery}`);
		}}
	>
		<input
			type="text"
			placeholder="Search..."
			bind:value={searchQuery}
			class="rounded-md bg-background hidden md:block"
			onkeydown={(event) => {
				if (searchForm && event.key === "Enter") {
					searchForm.requestSubmit();
				}
			}}
		/>
		<div class="flex gap-2 md:hidden">
			<button
				type="button"
				class="hover:cursor-pointer"
				onclick={() => {
					if (smallSearchElement) {
						smallSearchElement.ariaSelected = smallSearchElement.ariaSelected ? null : "true";
						smallSearchActive = smallSearchElement.ariaSelected === "true";
					}
				}}
			>
				<Search />
			</button>
			<input
				type="text"
				placeholder="Search..."
				bind:value={searchQuery}
				bind:this={smallSearchElement}
				class="rounded-md bg-background hidden aria-selected:block w-24"
				onkeydown={(event) => {
					if (searchForm && event.key === "Enter") {
						searchForm.requestSubmit();
					}
				}}
			/>
		</div>
	</form>

	{#if !smallSearchActive}
		{#if data.user}
			<a
				href={resolve("/upload")}
				class={`hidden sm:block ${page.route.id === "/upload" && "text-indigo-400"}`}
			>
				Upload
			</a>

			{#if satisfiesRole(data.user, "Moderator")}
				<a
					href={resolve("/dashboard/packs")}
					class={`${page.route.id?.startsWith("/dashboard") && "text-indigo-400"}`}
				>
					Dashboard
				</a>
			{/if}
		{/if}
	{/if}

	<a
		href={resolve("/leaderboard")}
		class={`hidden sm:block ${page.route.id?.startsWith("/leaderboard") && "text-indigo-400"}`}
	>
		Leaderboard
	</a>

	<span class="flex items-center gap-2 ml-auto">
		<a
			href={resolve("/contact")}
			class={`hidden sm:block ${page.route.id === "/contact" && "text-indigo-400"}`}>Contact</a
		>

		{#if data.user}
			<!-- TODO: Use superforms. -->
			<form action={resolve("/") + "?/logout"} method="post" use:enhance>
				<button type="submit" class="hover:cursor-pointer">Logout</button>
			</form>
		{:else}
			<a
				href={resolve("/login")}
				class={`${page.route.id?.startsWith("/login") && "text-indigo-400"}`}>Login</a
			>
		{/if}

		{#if data.user}
			<a href={resolve("/notifications")}>
				{#await data.notifications}
					<Bell />
				{:then notifications}
					{#if notifications.length <= 0}
						<Bell />
					{:else}
						<BellDot class="fill-blue-500" />
					{/if}
				{/await}
			</a>

			<a href={resolve("/@[username]", { username: data.user.username })} title="Profile">
				{#await avatarPromise}
					<div class="p-5 bg-white rounded-full"></div>
				{:then avatar}
					<img alt="Avatar" class="size-10" src={avatar.default.split("/static")[1]} />
				{/await}
			</a>
		{/if}
	</span>
</nav>

{@render children()}
