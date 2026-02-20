<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import GroupBig from "$lib/components/group-big.svelte";
	import UserBig from "$lib/components/user-big.svelte";
	import { slide } from "svelte/transition";

	let { children, data } = $props();

	let isOnUserPage = $derived(!page.route.id?.startsWith("/@[username]/-[packName]"));
</script>

{#if isOnUserPage}
	<!-- TODO: Make this work on mobile. -->
	<nav
		class="absolute flex flex-col h-screen right-0 min-w-32 lg:min-w-64 w-fit p-5 bg-header text-white gap-2 text-nowrap"
		transition:slide={{ axis: "x" }}
	>
		{#await data.currentUser}
			<p class="font-bold uppercase text-xl">User</p>
		{:then user}
			<p class="font-bold uppercase text-xl">{user.type}</p>
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
				{#if user.type === "User"}
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
					{#await data.canEditUser}
						<p>Loading...</p>
					{:then canEditUser}
						{#if canEditUser}
							<a
								href={resolve("/@[username]/members/new", { username: page.params.username! })}
								class={`ml-6 ${page.route.id === "/@[username]/members/new" && "text-indigo-400"}`}
							>
								New
							</a>
						{/if}
					{/await}
				{/if}
			{/await}
			<hr class="text-gray-700" />
			{#await data.canEditUser}
				<p>Loading...</p>
			{:then canEditUser}
				{#if canEditUser}
					<a
						href={resolve("/@[username]/settings", { username: page.params.username! })}
						class={`${page.route.id?.startsWith("/@[username]/settings") && "text-indigo-400"}`}
					>
						Settings
					</a>
				{/if}
			{/await}
		</div>
	</nav>
{/if}

<!-- The margin-right is the equal to the nav's `min-w` plus 2. -->
<div class={isOnUserPage ? "mr-34 lg:mr-66" : ""}>
	{#if isOnUserPage}
		{#await data.currentUser}
			<p>Loading...</p>
		{:then user}
			<div class="ml-2 my-2">
				{#if user.type === "User"}
					<UserBig {user} clientUser={data.user} />
				{:else}
					<GroupBig group={user} clientUser={data.user} />
				{/if}
			</div>
		{/await}
	{/if}

	{@render children()}
</div>
