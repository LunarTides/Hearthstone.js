<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.png";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { githubDarkDimmed } from "svelte-highlight/styles";
	import { enhance } from "$app/forms";
	import { satisfiesRole } from "$lib/user.js";
	import { ArrowLeft, Bell, BellDot, Menu, Search } from "lucide-svelte";
	import { PUBLIC_DOMAIN } from "$env/static/public";
	import { page } from "$app/state";
	import { slide } from "svelte/transition";

	let { children, data } = $props();

	let smallSearchElement = $state<HTMLElement>();
	let smallSearchActive = $state(false);
	let searchForm = $state<HTMLFormElement>();
	let searchQuery = $state("");

	let menuOpen = $state(false);

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
		role="search"
		onsubmit={(event) => {
			event.preventDefault();

			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(resolve("/search") + `?q=${searchQuery}`);
		}}
	>
		<!-- Desktop -->
		<input
			type="text"
			placeholder="Search..."
			bind:value={searchQuery}
			class="rounded-md bg-background hidden lg:block"
			onkeydown={(event) => {
				if (searchForm && event.key === "Enter") {
					searchForm.requestSubmit();
				}
			}}
		/>

		<!-- Mobile -->
		<div class="flex gap-2 lg:hidden">
			<!-- Search button on mobile. -->
			{#if !smallSearchActive}
				<button
					type="button"
					class="hover:cursor-pointer"
					onclick={() => {
						if (smallSearchElement) {
							smallSearchElement.ariaSelected = "true";
							smallSearchElement.focus();
							smallSearchActive = true;
						}
					}}
				>
					<Search />
				</button>
			{/if}
			<!-- Search box on mobile. -->
			<input
				type="text"
				placeholder="Search..."
				bind:value={searchQuery}
				bind:this={smallSearchElement}
				class="rounded-md bg-background hidden aria-selected:block w-fit"
				onfocusout={() => {
					if (smallSearchElement) {
						smallSearchElement.ariaSelected = null;
						smallSearchActive = false;
					}
				}}
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
					href={resolve("/dashboard")}
					class={`hidden sm:block ${page.route.id?.startsWith("/dashboard") && "text-indigo-400"}`}
				>
					Dashboard
				</a>
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

			<!-- Menu -->
			<button
				class="hover:cursor-pointer"
				onclick={() => {
					menuOpen = true;
				}}
			>
				<Menu />
			</button>

			{#if menuOpen}
				<aside>
					<nav
						class="absolute bg-header border-l right-0 top-0 h-full p-5 flex flex-col gap-1 sm:min-w-72 z-50 text-nowrap"
						transition:slide={{ axis: "x", duration: 200 }}
					>
						<button
							class="absolute right-3 hover:cursor-pointer"
							onclick={() => (menuOpen = false)}
						>
							<Menu />
						</button>
						<div class="mb-10"></div>
						<a href={resolve("/")} class={`${page.route.id === "/" && "text-indigo-400"}`}>Home</a>
						<a
							href={resolve("/leaderboard")}
							class={`${page.route.id?.startsWith("/leaderboard") && "text-indigo-400"}`}
						>
							Leaderboard
						</a>
						{#if data.user}
							<hr />
							<p class="text-gray-500 uppercase">User</p>
							<a
								href={resolve("/@[username]", { username: data.user.username })}
								class={`${page.route.id === "/@[username]" && "text-indigo-400"}`}
							>
								Profile
							</a>
							<a
								href={resolve("/@[username]/groups", { username: data.user.username })}
								class={`${page.route.id?.startsWith("/@[username]/groups") && "text-indigo-400"}`}
							>
								Groups
							</a>
							<a
								href={resolve("/@[username]/settings", { username: data.user.username })}
								class={`${page.route.id?.startsWith("/@[username]/settings") && "text-indigo-400"}`}
							>
								Settings
							</a>
							<a
								href={resolve("/notifications")}
								class={`${page.route.id?.startsWith("/notifications") && "text-indigo-400"}`}
							>
								Notifications
							</a>
							<a
								href={resolve("/upload")}
								class={`${page.route.id?.startsWith("/upload") && "text-indigo-400"}`}
							>
								Upload
							</a>

							{#if satisfiesRole(data.user, "Moderator")}
								<hr />
								<p class="text-gray-500 uppercase">Moderation</p>
								<a
									href={resolve("/dashboard")}
									class={`${page.route.id?.startsWith("/dashboard") && "text-indigo-400"}`}
								>
									Dashboard
								</a>
							{/if}
						{/if}
						<hr />
						<p class="text-gray-500 uppercase">Legal</p>
						<a
							href={resolve("/contact")}
							class={`${page.route.id?.startsWith("/contact") && "text-indigo-400"}`}
						>
							Contact
						</a>
						<a
							href={resolve("/terms")}
							class={`${page.route.id?.startsWith("/terms") && "text-indigo-400"}`}
						>
							Terms of Service
						</a>
						<a
							href={resolve("/privacy")}
							class={`${page.route.id?.startsWith("/privacy") && "text-indigo-400"}`}
						>
							Privacy Policy
						</a>
					</nav>
				</aside>
			{/if}
		</span>
	{/if}
</nav>

{@render children()}
