<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { satisfiesRole } from "$lib/user.js";

	let { children, data } = $props();
</script>

<nav class="flex items-center my-1 rounded-md p-5 bg-header text-white gap-2">
	<a href={resolve("/dashboard/packs")} class="font-bold uppercase text-xl">Dashboard</a>
	<p class="text-4xl font-thin">|</p>

	<div class="text-lg">
		<a
			href={resolve("/dashboard/packs")}
			class={`${page.route.id?.startsWith("/dashboard/packs") && "text-indigo-400"}`}>Packs</a
		>

		{#if satisfiesRole(data.user, "Admin")}
			<a
				href={resolve("/dashboard/admin/settings")}
				class={`${page.route.id?.startsWith("/dashboard/admin/settings") && "text-indigo-400"}`}
			>
				Settings
			</a>
		{/if}
	</div>
</nav>

{@render children()}
