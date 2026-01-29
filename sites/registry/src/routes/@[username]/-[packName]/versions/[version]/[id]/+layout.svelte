<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import PackBig from "$lib/components/pack-big.svelte";
	import type { PackWithExtras } from "$lib/db/schema.js";
	import { satisfiesRole } from "$lib/user";
	import {
		CardSim,
		Cog,
		FolderCode,
		History,
		Info,
		MessageSquare,
		Parentheses,
	} from "lucide-svelte";
	import { superForm } from "sveltekit-superforms";

	let { data, form: rawForm, children } = $props();
	const { form } = $derived(superForm(data.form));

	// Some real typescript magic rig/ht here. Wow...
	let packs = $state<
		Promise<{ current: PackWithExtras; latest: PackWithExtras; all: PackWithExtras[] }>
	>(Promise.resolve() as any);

	let canEditPack = $state(false);
	const canModeratePack = $derived(satisfiesRole(data.user, "Moderator"));

	// TODO: Do this server-side.
	$effect(() => {
		(async () => {
			const ps = await data.packs;
			const found = ps.all.find((v) => v.id === page.params.id);
			if (!found) {
				// TODO: Error handling.
				return;
			}

			packs = Promise.resolve({ current: found, latest: ps.latest, all: ps.all });
			// TODO: Account for groups.
			canEditPack = found.ownerName === data.user?.username;
		})();
	});
</script>

{#await packs}
	<p>Loading...</p>
{:then versions}
	<PackBig
		packs={{
			...versions,
			latest: versions.all.find((v) => v.isLatestVersion)!,
		}}
		user={data.user}
		{form}
		{rawForm}
		individual
		showDownloadButton
		class="rounded-b-none"
	/>

	<nav>
		<div class="flex gap-1 m-1">
			<!-- README -->
			{#if page.route.id !== `/@[username]/-[packName]/versions/[version]/[id]`}
				<a
					href={resolve("/@[username]/-[packName]/versions/[version]/[id]", {
						username: page.params.username!,
						packName: page.params.packName!,
						version: page.params.version!,
						id: page.params.id!,
					})}
					class="p-2 w-full text-center flex justify-center gap-1 bg-blue-400 hover:bg-blue-300 active:bg-blue-500"
				>
					<Info />
					README
				</a>
			{:else}
				<p
					title="You're already on this page."
					class="p-2 w-full text-center flex justify-center gap-1 bg-gray-400 hover:cursor-default"
					aria-disabled="true"
				>
					<Info />
					README
				</p>
			{/if}

			<!-- Code -->
			{#if !page.route.id?.startsWith(`/@[username]/-[packName]/versions/[version]/[id]/files`)}
				<a
					href={resolve("/@[username]/-[packName]/versions/[version]/[id]/files", {
						username: page.params.username!,
						packName: page.params.packName!,
						version: page.params.version!,
						id: page.params.id!,
					})}
					class="p-2 w-full text-center flex justify-center gap-1 bg-blue-400 hover:bg-blue-300 active:bg-blue-500"
				>
					<FolderCode />
					Code
				</a>
			{:else}
				<p
					title="You're already on this page."
					class="p-2 w-full text-center flex justify-center gap-1 bg-gray-400 hover:cursor-default"
					aria-disabled="true"
				>
					<FolderCode />
					Code
				</p>
			{/if}

			<!-- Cards -->
			{#if !page.route.id?.startsWith(`/@[username]/-[packName]/versions/[version]/[id]/cards`)}
				<a
					href={resolve("/@[username]/-[packName]/versions/[version]/[id]/cards", {
						username: page.params.username!,
						packName: page.params.packName!,
						version: page.params.version!,
						id: page.params.id!,
					})}
					class="p-2 w-full text-center flex justify-center gap-1 bg-blue-400 hover:bg-blue-300 active:bg-blue-500"
				>
					<Parentheses />
					{#await data.cards}
						<p>Cards (...)</p>
					{:then cards}
						<p>Cards ({cards.length})</p>
					{/await}
				</a>
			{:else}
				<p
					title="You're already on this page."
					class="p-2 w-full text-center flex justify-center gap-1 bg-gray-400 hover:cursor-default"
					aria-disabled="true"
				>
					<Parentheses />
					{#await data.cards}
						<p>Cards (...)</p>
					{:then cards}
						<p>Cards ({cards.length})</p>
					{/await}
				</p>
			{/if}

			<!-- Comments -->
			{#if !page.route.id?.startsWith(`/@[username]/-[packName]/versions/[version]/[id]/comments`)}
				<a
					href={resolve("/@[username]/-[packName]/versions/[version]/[id]/comments", {
						username: page.params.username!,
						packName: page.params.packName!,
						version: page.params.version!,
						id: page.params.id!,
					})}
					class="p-2 w-full text-center flex justify-center gap-1 bg-blue-400 hover:bg-blue-300 active:bg-blue-500"
				>
					<MessageSquare />
					<!-- TODO: Show amount of comments. -->
					Comments
				</a>
			{:else}
				<p
					title="You're already on this page."
					class="p-2 w-full text-center flex justify-center gap-1 bg-gray-400 hover:cursor-default"
					aria-disabled="true"
				>
					<MessageSquare />
					<!-- TODO: Show amount of comments. -->
					Comments
				</p>
			{/if}

			<!-- Versions -->
			{#if !page.route.id?.startsWith(`/@[username]/-[packName]/versions/[version]/[id]/versions`)}
				<a
					href={resolve("/@[username]/-[packName]/versions/[version]/[id]/versions", {
						username: page.params.username!,
						packName: page.params.packName!,
						version: page.params.version!,
						id: page.params.id!,
					})}
					class="p-2 w-full text-center flex justify-center gap-1 bg-blue-400 hover:bg-blue-300 active:bg-blue-500"
				>
					<History />
					<p>Versions ({versions.all.length})</p>
				</a>
			{:else}
				<div
					title="You're already on this page."
					class="p-2 w-full text-center flex justify-center gap-1 bg-gray-400 hover:cursor-default"
					aria-disabled="true"
				>
					<History />
					<p>Versions ({versions.all.length})</p>
				</div>
			{/if}

			{#if canEditPack || canModeratePack}
				<!-- Settings -->
				{#if !page.route.id?.startsWith(`/@[username]/-[packName]/versions/[version]/[id]/settings`)}
					<a
						href={resolve("/@[username]/-[packName]/versions/[version]/[id]/settings", {
							username: page.params.username!,
							packName: page.params.packName!,
							version: page.params.version!,
							id: page.params.id!,
						})}
						class="p-2 w-full text-center flex justify-center gap-1 bg-blue-400 hover:bg-blue-300 active:bg-blue-500"
					>
						<Cog />
						Settings
					</a>
				{:else}
					<p
						title="You're already on this page."
						class="p-2 w-full text-center flex justify-center gap-1 bg-gray-400 hover:cursor-default"
						aria-disabled="true"
					>
						<Cog />
						Settings
					</p>
				{/if}
			{/if}
		</div>
	</nav>
{/await}

{@render children()}
