<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { ChevronLeft, ChevronRight } from "lucide-svelte";
	import { slide } from "svelte/transition";

	let { children } = $props();

	let sidebarVisible = $state(true);
	let sidebarWidth = $state(0);
	let sidebarAnimating = $state(false);
</script>

{#if sidebarVisible}
	<nav
		class="fixed flex flex-col h-screen min-w-32 lg:min-w-64 w-fit rounded-md p-5 bg-header text-white gap-2 text-nowrap"
		transition:slide={{ axis: "x" }}
		bind:clientWidth={sidebarWidth}
		onintrostart={() => (sidebarAnimating = true)}
		onoutrostart={() => (sidebarAnimating = true)}
		onintroend={() => (sidebarAnimating = false)}
		onoutroend={() => (sidebarAnimating = false)}
	>
		<button
			class="self-end fixed hover:cursor-pointer"
			onclick={() => (sidebarVisible = !sidebarVisible)}
		>
			<ChevronLeft />
		</button>

		<p class="font-bold uppercase text-xl">Packs</p>

		<div class="flex flex-col gap-1">
			<a
				href={resolve("/dashboard/packs/waiting-for-approval")}
				class={`${page.route.id === "/dashboard/packs/waiting-for-approval" && "text-indigo-400"}`}
				>Waiting for Approval</a
			>
			<hr class="text-gray-700" />
			<a
				href={resolve("/dashboard/packs/reserved")}
				class={`${page.route.id === "/dashboard/packs/reserved" && "text-indigo-400"}`}>Reserved</a
			>
		</div>
	</nav>
{:else}
	<button
		class="fixed p-0.5 bg-header h-screen rounded-md hover:cursor-pointer"
		onclick={() => (sidebarVisible = !sidebarVisible)}
		in:slide={{ axis: "x" }}
	>
		<ChevronRight />
	</button>
{/if}

<div
	class={`${!sidebarAnimating && sidebarVisible ? "ml-49.5 lg:ml-65" : "ml-8"}`}
	style={`${sidebarAnimating && sidebarWidth > 28 && `margin-left: ${sidebarWidth + 4}px;`}`}
>
	{@render children()}
</div>
