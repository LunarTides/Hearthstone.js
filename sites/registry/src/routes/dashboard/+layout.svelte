<script lang="ts">
	import { resolve } from "$app/paths";
	import { satisfiesRole } from "$lib/user.js";

	let { children, data } = $props();
</script>

<nav class="flex items-center p-5 bg-slate-600 text-white gap-2">
	<a href={resolve("/dashboard/packs")} class="font-bold uppercase text-xl">Dashboard</a>
	<p class="text-4xl font-thin">|</p>

	<div class="text-lg">
		<a href={resolve("/dashboard/packs")}>Packs</a>

		{#if satisfiesRole(data.user, "Admin")}
			<a href={resolve("/dashboard/admin/settings")}>Settings</a>
		{/if}
	</div>
</nav>

{@render children()}
