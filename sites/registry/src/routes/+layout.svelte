<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { githubDarkDimmed } from "svelte-highlight/styles";
	import { enhance } from "$app/forms";
	import { satisfiesRole } from "$lib/user.js";
	import { ArrowLeft, Bell, BellDot } from "lucide-svelte";
	import { PUBLIC_DOMAIN } from "$env/static/public";

	let { children, data } = $props();

	let searchQuery = $state("");

	const avatarPromise = import(`$lib/../../static/avatars/${data.user?.id}.avif`).catch(() => {});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html githubDarkDimmed}
</svelte:head>

<nav class="flex items-center p-3 text-white gap-2" style="background-color: var(--color-header);">
	{#if PUBLIC_DOMAIN !== "http://localhost"}
		<a href={PUBLIC_DOMAIN}>
			<ArrowLeft />
		</a>

		<p class="text-4xl font-thin text-gray-600">|</p>
	{/if}

	<a href={resolve("/")} class="font-bold uppercase text-xl">Registry</a>
	<p class="text-4xl font-thin text-gray-600">|</p>

	<!-- TODO: Use superforms. -->
	<form
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
			class="rounded-md bg-background"
		/>
	</form>

	{#if data.user}
		<a href={resolve("/upload")}>Upload</a>

		{#if satisfiesRole(data.user, "Moderator")}
			<a href={resolve("/dashboard/packs")}>Dashboard</a>
		{/if}
	{/if}

	<span class="flex items-center gap-2 ml-auto">
		<a href={resolve("/contact")}>Contact</a>

		{#if data.user}
			<!-- TODO: Use superforms. -->
			<form action={resolve("/") + "?/logout"} method="post" use:enhance>
				<button type="submit" class="hover:cursor-pointer">Logout</button>
			</form>
		{:else}
			<a href={resolve("/login")}>Login</a>
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

			<a href={resolve("/user/[uuid]", { uuid: data.user.id })} title="Profile">
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
