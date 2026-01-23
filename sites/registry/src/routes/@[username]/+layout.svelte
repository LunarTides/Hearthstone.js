<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import UserBig from "$lib/components/user-big.svelte";
	import { slide } from "svelte/transition";

	let { children, data } = $props();

	let isOnUserPage = $derived(!page.route.id?.startsWith("/@[username]/-[packName]"));
</script>

{#if isOnUserPage}
	<nav
		class="fixed flex flex-col h-screen right-0 min-w-32 lg:min-w-64 w-fit p-5 bg-header text-white gap-2 text-nowrap"
		transition:slide={{ axis: "x" }}
	>
		{#await data.currentUser}
			<p class="font-bold uppercase text-xl">User</p>
		{:then user}
			<p class="font-bold uppercase text-xl">{user.ownerType}</p>
		{/await}

		<div class="flex flex-col gap-1">
			<a
				href={resolve("/@[username]", { username: page.params.username! })}
				class={`${page.route.id === "/@[username]" && "text-indigo-400"}`}
			>
				Packs
			</a>
			<!-- <hr class="text-gray-700" /> -->
			{#await data.currentUser}
				<p>Loading...</p>
			{:then user}
				{#if user.ownerType === "User"}
					<a
						href={resolve("/@[username]/groups", { username: page.params.username! })}
						class={`${page.route.id === "/@[username]/groups" && "text-indigo-400"}`}
					>
						Groups
					</a>
				{:else}
					<a
						href={resolve("/@[username]/members", { username: page.params.username! })}
						class={`${page.route.id === "/@[username]/members" && "text-indigo-400"}`}
					>
						Members
					</a>
				{/if}
			{/await}
			<hr class="text-gray-700" />
			{#await data.currentUser}
				<p>Loading...</p>
			{:then user}
				<!-- TODO: Handle groups. -->
				{#if user.username === data.user?.username}
					<a
						href={resolve("/@[username]/settings", { username: page.params.username! })}
						class={`${page.route.id === "/@[username]/settings" && "text-indigo-400"}`}
					>
						Settings
					</a>
				{/if}
			{/await}
		</div>
	</nav>
{/if}

<div class={isOnUserPage ? "mr-49.5 lg:mr-65" : ""}>
	{#if isOnUserPage}
		{#await data.currentUser}
			<p>Loading...</p>
		{:then user}
			<div class="m-2">
				<UserBig {user} clientUser={data.user} />
			</div>
		{/await}
	{/if}

	{@render children()}
</div>
