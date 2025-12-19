<script lang="ts">
	import { resolve } from "$app/paths";
	import cardboard from "$lib/assets/cardboard-texture.avif";
	import { type Card, type PackWithExtras } from "$lib/db/schema";
	import { ThumbsDown, ThumbsUp } from "lucide-svelte";
	import { enhance } from "$app/forms";
	import { satisfiesRole } from "$lib/user";
	import type { ClientUser } from "$lib/server/auth";
	import Badge from "./badge.svelte";

	let {
		packs,
		cards,
		user,
		hideButtons = false,
		showDownloadButton = false,
		deleteButtonBuiltin = false,
		individual = false,
		form = undefined,
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
		deleteButtonBuiltin?: boolean;
		individual?: boolean;
		form?: any;
		class?: string;
	} = $props();

	const pack = $derived(packs.current ?? packs.latest);

	const canEditPack = $derived(pack.userIds.includes(user?.id || "0"));
	const canModeratePack = $derived(satisfiesRole(user, "Moderator"));

	let deleteConfirm = $state(0);
	let approveConfirm = $state(0);

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
		if (form?.file) {
			const element = document.createElement("a");
			element.href = window.URL.createObjectURL(new Blob([form.file]));
			element.download = form.filename;
			element.click();
		}
	});
</script>

<!-- TODO: Deduplicate code between this and the small pack. -->
<div
	class={`rounded-xl rounded-t-none p-7 bg-cover bg-gray-300 bg-blend-multiply text-white ${className ?? ""}`}
	style={`background-image: url(${cardboard});`}
>
	{#if !hideButtons}
		<div class="flex flex-col float-right text-nowrap m-2 mt-4 gap-2">
			<div class="flex bg-blue-300 drop-shadow-2xl rounded-full text-black outline-1 outline-black">
				{#if showDownloadButton && pack.approved}
					<form
						action={resolve("/pack/[uuid]/versions/[version]", {
							uuid: pack.uuid,
							version: pack.packVersion,
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
				<a
					href={resolve("/pack/[uuid]/versions", { uuid: pack.uuid })}
					class="px-5 py-3 hover:bg-cyan-200 active:bg-blue-400"
				>
					Versions ({packs.all.length})
				</a>
				<div class="border-l ml-auto h-auto"></div>
				<a
					href={resolve("/pack/[uuid]", { uuid: pack.uuid })}
					class="px-5 py-3 w-full rounded-r-full hover:bg-cyan-200 active:bg-blue-400"
				>
					<!-- TODO: This is 0 if viewing an unapproved pack and there aren't any other versions. -->
					Cards ({cards.all.filter((c) => c.isLatestVersion).length})
				</a>
			</div>

			{#if canEditPack || canModeratePack}
				<div
					class="flex bg-red-300 drop-shadow-2xl rounded-full text-black outline-1 outline-black"
				>
					<a
						href={resolve("/pack/[uuid]/edit", { uuid: pack.uuid })}
						class="px-5 py-3 w-full rounded-l-full hover:bg-red-200 active:bg-red-400"
					>
						Edit
					</a>
					<div class="border-l ml-auto h-auto"></div>
					<a
						href={resolve("/pack/[uuid]/edit", { uuid: pack.uuid })}
						class="px-5 py-3 w-full hover:bg-red-200 active:bg-red-400"
					>
						(Reserved)
					</a>
					<div class="border-l ml-auto h-auto"></div>
					{#if deleteButtonBuiltin}
						{#if deleteConfirm < 2}
							<button
								class="px-5 py-3 w-full rounded-r-full hover:cursor-pointer hover:bg-red-200 active:bg-red-400"
								onclick={() => {
									deleteConfirm++;
								}}
							>
								{#if deleteConfirm === 0}
									Delete Version
								{:else if deleteConfirm === 1}
									Really delete?
								{/if}
							</button>
						{:else}
							<form
								action={resolve("/pack/[uuid]/versions/[version]", {
									uuid: pack.uuid,
									version: pack.packVersion,
								}) + "?/delete"}
								method="post"
								use:enhance
							>
								{#if form?.message}<p class="text-red-500">{form.message}</p>{/if}
								<button
									type="submit"
									class="px-5 py-3 w-full rounded-r-full bg-red-500 hover:cursor-pointer hover:bg-red-400 active:bg-red-600"
								>
									<p>Really <em>REALLY</em> delete? You cannot undo this action.</p>
								</button>
							</form>
						{/if}
					{:else}
						<a
							href={resolve("/pack/[uuid]/delete", { uuid: pack.uuid })}
							class="px-5 py-3 w-full rounded-r-full hover:bg-red-200 active:bg-red-400"
						>
							Delete Pack
						</a>
					{/if}
				</div>
			{/if}

			{#if canModeratePack}
				<div class="flex bg-black text-white drop-shadow-2xl rounded-full outline-1 outline-white">
					{#if pack.approved}
						<a
							href={resolve("/pack/[uuid]", { uuid: pack.uuid })}
							class="px-5 py-3 w-full rounded-l-full hover:bg-gray-800 active:bg-black"
						>
							<!-- TODO: Change depending on if it's listed or not. -->
							(Un)list
						</a>
					{:else}
						<!-- Approve -->
						{#if approveConfirm === 0}
							<button
								class="px-5 py-3 w-full rounded-l-full hover:cursor-pointer hover:bg-gray-800 active:bg-black"
								onclick={() => approveConfirm++}
							>
								Approve
							</button>
						{:else}
							<form
								action={resolve("/pack/[uuid]/versions/[version]", {
									uuid: pack.uuid,
									version: pack.packVersion,
								}) + "?/approve"}
								method="post"
								use:enhance
							>
								{#if form?.message}<p class="text-red-500">{form.message}</p>{/if}
								<button
									type="submit"
									class="px-5 py-3 w-full rounded-l-full hover:cursor-pointer hover:bg-gray-800 active:bg-black"
								>
									Are you sure?
								</button>
							</form>
						{/if}
					{/if}
					<div class="border-l ml-auto h-auto"></div>
					<a
						href={resolve("/pack/[uuid]", { uuid: pack.uuid })}
						class="px-5 py-3 w-full hover:bg-gray-800 active:bg-black"
					>
						(Reserved)
					</a>
					<div class="border-l ml-auto h-auto"></div>
					<a
						href={resolve("/pack/[uuid]", { uuid: pack.uuid })}
						class="px-5 py-3 w-full rounded-r-full hover:bg-gray-800 active:bg-black"
					>
						(Reserved)
					</a>
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

			{#if satisfiesRole(user, "Moderator")}
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
				<form
					action={resolve("/pack/[uuid]", { uuid: pack.uuid }) + "?/like"}
					method="post"
					use:enhance
				>
					<!-- TODO: These are glitchy on the card page. -->
					<button type="submit" class="flex gap-1 mt-4 hover:cursor-pointer">
						<ThumbsUp class={pack.likes.hasLiked ? "fill-green-400" : ""} />
						<p class="font-mono text-lg">{pack.likes.positive}</p>
					</button>
				</form>

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
			{#if !pack.approved}
				<Badge class="bg-yellow-300 text-slate-600">Waiting for approval</Badge>
			{/if}
		</div>
	</div>
</div>
