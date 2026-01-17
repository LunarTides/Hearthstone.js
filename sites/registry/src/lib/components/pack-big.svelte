<script lang="ts">
	import { resolve } from "$app/paths";
	import type { Card, PackWithExtras } from "$lib/db/schema";
	import { ThumbsDown, ThumbsUp } from "lucide-svelte";
	import { enhance } from "$app/forms";
	import { satisfiesRole } from "$lib/user";
	import type { ClientUser } from "$lib/server/auth";
	import Badge from "./badge.svelte";
	import { page } from "$app/state";

	let {
		packs,
		cards,
		user,
		hideButtons = false,
		showDownloadButton = false,
		individual = false,
		form = undefined,
		rawForm = undefined,
		class: className,
	}: {
		packs: {
			latest: PackWithExtras;
			current?: PackWithExtras;
			all: PackWithExtras[];
		};
		cards: {
			all: Card[];
		};
		user: ClientUser;
		hideButtons?: boolean;
		showDownloadButton?: boolean;
		individual?: boolean;
		form?: any;
		rawForm?: any;
		class?: string;
	} = $props();

	const pack = $derived(packs.current ?? packs.latest);

	const canEditPack = $derived(user?.username === pack.ownerName);
	const canModeratePack = $derived(satisfiesRole(user, "Moderator"));

	// https://stackoverflow.com/a/18650828
	function formatBytes(bytes: number, decimals = 2) {
		if (!+bytes) {
			return "0 Bytes";
		}

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}

	$effect(() => {
		// Download the file.
		if (rawForm?.file) {
			const element = document.createElement("a");
			element.href = window.URL.createObjectURL(new Blob([rawForm.file]));
			element.download = rawForm.filename;
			element.click();
		}
	});
</script>

<!-- TODO: Deduplicate code between this and the small pack. -->
<div class={`rounded-xl rounded-t-none p-7 bg-cover text-white ${className ?? ""}`}>
	{#if !hideButtons}
		<div class="flex flex-col float-right text-nowrap m-2 mt-4 gap-2">
			<div class="flex bg-blue-300 drop-shadow-2xl rounded-full text-black outline-1 outline-black">
				{#if showDownloadButton && pack.approved}
					<!-- TODO: Use superforms. -->
					<form
						action={resolve("/pack/[uuid]/versions/[version]/[id]", {
							uuid: pack.uuid,
							version: pack.packVersion,
							id: pack.id,
						}) + "?/download"}
						method="post"
						use:enhance
					>
						{#if form?.message}<p class="text-red-500">{form.message}</p>{/if}
						<button
							type="submit"
							class="px-5 py-3 w-full rounded-l-full hover:cursor-pointer hover:bg-cyan-200 active:bg-blue-400"
						>
							Download
						</button>
					</form>
					<div class="border-l ml-auto h-auto"></div>
				{:else}
					<p class="px-5 py-3 w-full bg-gray-300 text-gray-700 rounded-l-full hover:cursor-default">
						Download
					</p>
					<div class="border-l ml-auto h-auto"></div>
				{/if}
				{#if page.route.id === "/pack/[uuid]/versions"}
					<p class="px-5 py-3 bg-gray-300 text-gray-700 hover:cursor-default">
						Versions ({packs.all.length})
					</p>
				{:else}
					<a
						href={resolve("/pack/[uuid]/versions", { uuid: pack.uuid })}
						class="px-5 py-3 hover:bg-cyan-200 active:bg-blue-400"
					>
						Versions ({packs.all.length})
					</a>
				{/if}
				<div class="border-l ml-auto h-auto"></div>
				{#if page.route.id === "/pack/[uuid]"}
					<p class="px-5 py-3 w-full rounded-r-full bg-gray-300 text-gray-700 hover:cursor-default">
						<!-- TODO: This is 0 if viewing an unapproved pack and there aren't any other versions. -->
						Cards ({cards.all.filter((c) => c.isLatestVersion).length})
					</p>
				{:else}
					<a
						href={resolve("/pack/[uuid]", { uuid: pack.uuid })}
						class="px-5 py-3 w-full rounded-r-full hover:bg-cyan-200 active:bg-blue-400"
					>
						<!-- TODO: This is 0 if viewing an unapproved pack and there aren't any other versions. -->
						Cards ({cards.all.filter((c) => c.isLatestVersion).length})
					</a>
				{/if}
			</div>

			{#if canModeratePack}
				<div class="flex bg-black text-white drop-shadow-2xl rounded-full outline-1 outline-white">
					<p class="px-5 py-3 w-full rounded-l-full text-gray-500 hover:cursor-default">
						(Reserved)
					</p>
					<div class="border-l ml-auto h-auto"></div>
					<p class="px-5 py-3 w-full rounded-l-full text-gray-500 hover:cursor-default">
						(Reserved)
					</p>
					<div class="border-l ml-auto h-auto"></div>
					<p class="px-5 py-3 w-full rounded-l-full text-gray-500 hover:cursor-default">
						(Reserved)
					</p>
				</div>
			{/if}
		</div>
	{/if}

	<div class="flex flex-col">
		<div class="flex gap-1">
			<h1 class="text-xl font-bold">{pack.name}</h1>
			{#if !pack.isLatestVersion}
				<p class="text-gray-300 self-center">(v{pack.packVersion})</p>
			{/if}
		</div>
		<!-- TODO: Add clicking on the author if they have a connected account. -->
		<p class="font-semibold">({pack.authors.join(", ")})</p>
		{#if canEditPack}
			<!-- TODO: Localize. -->
			<p class="text-green-300">You can administrate this pack.</p>
		{/if}

		<p class="mt-4">{pack.description}</p>

		<!-- TODO: Add links. -->

		<div>
			<div class="flex mt-4 gap-2">
				<div>
					<p class="text-lg font-semibold">Pack Version</p>
					<hr />
					<p>{pack.packVersion}</p>
				</div>

				<div>
					<p class="text-lg font-semibold">Game Version</p>
					<hr />
					<p>{pack.gameVersion}</p>
				</div>

				<div>
					<p class="text-lg font-semibold">Unpacked Size</p>
					<hr />
					<p>{formatBytes(pack.unpackedSize)}</p>
				</div>

				<div>
					<p class="text-lg font-semibold">Downloads</p>
					<hr />
					<p>
						{!individual ? pack.totalDownloadCount : pack.downloadCount}
					</p>
				</div>

				<div>
					<p class="text-lg font-semibold">License</p>
					<hr />
					<p>{pack.license}</p>
				</div>
			</div>

			<div>
				<div class="w-fit">
					<p class="text-lg font-semibold">Permissions</p>
					<hr />
					{#if pack.permissions.length > 0}
						<p class="text-amber-300">{pack.permissions.join(", ")}</p>
					{:else}
						<p class="text-green-300">None</p>
					{/if}
				</div>
			</div>

			{#if pack.approved && satisfiesRole(user, "Moderator")}
				<div class="flex mt-4 gap-2">
					<div>
						<p class="text-lg font-semibold">Approved By</p>
						<hr />
						<p>{pack.approvedByUser?.username}</p>
					</div>
				</div>
			{/if}
		</div>

		{#if !hideButtons && pack.approved}
			<!-- TODO: Get the form message here. -->
			{#if form?.message}<p class="text-red-500">{form.message}</p>{/if}
			<div class="flex gap-4">
				<!-- TODO: Use superforms. -->
				<form
					action={resolve("/pack/[uuid]", { uuid: pack.uuid }) + "?/like"}
					method="post"
					use:enhance
				>
					<!-- TODO: These are glitchy on the card page. -->
					<button type="submit" class="flex gap-1 mt-4 hover:cursor-pointer">
						<ThumbsUp class={pack.likes.hasLiked ? "fill-green-500" : ""} />
						<p class="font-mono text-lg">{pack.likes.positive}</p>
					</button>
				</form>

				<!-- TODO: Use superforms. -->
				<form
					action={resolve("/pack/[uuid]", { uuid: pack.uuid }) + "?/dislike"}
					method="post"
					use:enhance
				>
					<!-- TODO: Get the form message here. -->
					<button type="submit" class="flex gap-1 mt-4 hover:cursor-pointer">
						<ThumbsDown class={pack.likes.hasDisliked ? "fill-red-400" : ""} />
						<p class="font-mono text-lg">{pack.likes.negative}</p>
					</button>
				</form>
			</div>
		{/if}

		<div class="flex gap-1 not-empty:mt-2">
			{#if pack.denied}
				<Badge
					class="bg-red-400 text-black"
					title="This pack has been denied public access by a Moderator.">Denied</Badge
				>
			{:else if !pack.approved}
				<Badge
					class="bg-yellow-400 text-black"
					title="This pack is waiting to be approved by a Moderator.">Waiting for approval</Badge
				>
			{/if}
		</div>
	</div>
</div>
