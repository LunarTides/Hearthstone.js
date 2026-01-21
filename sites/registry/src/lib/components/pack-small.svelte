<script lang="ts">
	import { resolve } from "$app/paths";
	import type { PackWithExtras } from "$lib/db/schema";
	import { Download, Medal, ThumbsDown, ThumbsUp } from "lucide-svelte";
	import Badge from "./badge.svelte";
	import type { ClientUser } from "$lib/server/auth";
	import { satisfiesRole } from "$lib/user";

	let {
		pack,
		clientUser,
		navigateToVersion = false,
		hideApprovalBadge = false,
	}: {
		pack: PackWithExtras;
		clientUser: ClientUser;
		navigateToVersion?: boolean;
		hideApprovalBadge?: boolean;
	} = $props();
</script>

<div class="w-fit min-w-77.5">
	<a
		href={navigateToVersion
			? resolve("/@[username]/-[packName]/versions/[version]/[id]", {
					username: pack.ownerName,
					packName: pack.name,
					version: pack.packVersion,
					id: pack.id,
				})
			: resolve("/@[username]/-[packName]", { username: pack.ownerName, packName: pack.name })}
	>
		<div
			class="text-white p-4 rounded-xl w-fit bg-cover transition-all bg-header hover:scale-105 hover:drop-shadow-2xl"
		>
			<p class="font-bold">{pack.name} ({pack.packVersion})</p>
			<div class="flex mb-2 text-xs gap-1">
				<p>{pack.ownerName}</p>

				<!-- Karma -->
				{#if pack.owner && satisfiesRole(clientUser, "Moderator")}
					<div class="flex bg-background p-1 rounded-sm">
						<Medal size="16" class={pack.owner.karma >= 0 ? "text-yellow-300" : "text-red-400"} />
						<p>{pack.owner.karma}</p>
					</div>
				{/if}
			</div>
			<p>{pack.description}</p>
			<p class="font-mono">({pack.license} | {pack.gameVersion})</p>

			{#if pack.approved}
				<div class="flex gap-4">
					<div class="flex gap-1">
						<Download />
						<p class="text-lg font-bold font-mono">{pack.totalDownloadCount}</p>
					</div>
					<div class="flex gap-1">
						{#if pack.likes.positive >= pack.likes.negative}
							<ThumbsUp class={pack.likes.hasLiked ? "fill-green-500" : ""} />
						{:else}
							<ThumbsDown class={pack.likes.hasDisliked ? "fill-red-400" : ""} />
						{/if}
						<p class="text-lg font-bold font-mono">
							{pack.likes.positive - pack.likes.negative}
						</p>
					</div>
				</div>
			{/if}

			<div class="flex gap-1 not-empty:mt-1">
				{#if !hideApprovalBadge}
					{#if pack.denied}
						<Badge
							class="bg-red-400 text-black"
							title="This pack has been denied public access by a Moderator.">Denied</Badge
						>
					{:else if !pack.approved}
						<Badge
							class="bg-yellow-300 text-black"
							title="This pack is waiting to be approved by a Moderator."
							>Waiting for approval</Badge
						>
					{/if}
				{/if}
			</div>
		</div>
	</a>
</div>
