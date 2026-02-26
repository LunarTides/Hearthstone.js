<script lang="ts">
	import { enhance } from "$app/forms";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import Badge from "$lib/components/badge.svelte";
	import { satisfiesRole } from "$lib/user";
	import { Heart, HeartPlus, ThumbsDown, ThumbsUp, Trash2 } from "lucide-svelte";
	import type { CommentWithExtras } from "$lib/db/schema";
	import type { ClientUser } from "$lib/server/auth";
	import { dateFormat } from "$lib/date";

	let {
		comment,
		clientUser,
		packOwnerName,
	}: {
		comment: CommentWithExtras;
		clientUser: ClientUser;
		packOwnerName: string;
	} = $props();

	let commentDeleteConfirm = $state("");
</script>

<div
	id={`comment-${comment.id}`}
	class="flex flex-col gap-2 p-2 bg-background rounded-xl text-white target:outline"
>
	<div>
		{#if comment.username === clientUser?.username || satisfiesRole(clientUser, "Moderator")}
			{#if commentDeleteConfirm === comment.id}
				<!-- TODO: Use superforms. -->
				<form
					action={resolve("/@[username]/-[packName]/v[version]/comments/[commentId]", {
						username: page.params.username!,
						packName: page.params.packName!,
						version: comment.pack.packVersion,
						commentId: comment.id,
					}) + "?/delete"}
					method="post"
					use:enhance
				>
					<button
						type="submit"
						class="float-right m-1 animate-pulse text-red-400 hover:cursor-pointer"
					>
						<Trash2 />
					</button>
				</form>
			{:else}
				<button
					class="float-right m-1 hover:cursor-pointer"
					onclick={() => (commentDeleteConfirm = comment.id)}
				>
					<Trash2 />
				</button>
			{/if}
		{/if}

		<div class="flex flex-wrap sm:flex-nowrap gap-2">
			{#if comment.author}
				<a href={resolve("/@[username]", { username: comment.author.username })} class="flex gap-2">
					<!-- TODO: Add avatar -->
					<div class="p-4 bg-white rounded-full"></div>
					<p class="text-lg self-center font-mono">{comment.author.username}</p>
				</a>
				<div class="flex gap-1">
					{#if comment.username === clientUser?.username}
						<Badge class="bg-indigo-300 h-fit self-center text-black">You</Badge>
					{/if}
					{#if satisfiesRole(comment.author, "Moderator")}
						<Badge class="bg-blue-200 h-fit self-center text-black">
							{comment.author.role}
						</Badge>
					{/if}
				</div>
			{:else}
				<div class="flex gap-2">
					<!-- TODO: Add avatar -->
					<div class="p-4 bg-red-400 rounded-full"></div>
					<p class="text-lg self-center font-mono">(Deleted)</p>
				</div>
				<Badge class="bg-red-400 h-fit self-center text-black">Deleted User</Badge>
			{/if}

			<p class="self-center text-gray-500">({comment.pack.packVersion})</p>
		</div>
	</div>

	<pre class="font-sans text-wrap">{comment.text}</pre>
	<!-- TODO: `comment.creationDate` is a string for some reason? -->
	<p class="text-gray-600">{dateFormat.format(new Date(comment.creationDate))}</p>

	<!-- TODO: Get the form message here. -->
	<!-- {#if form?.message}<p class="text-red-500">{form.message}</p>{/if} -->
	<div class="flex gap-3">
		<!-- TODO: Use superforms. -->
		<form
			action={resolve("/@[username]/-[packName]/v[version]/comments/[commentId]", {
				username: page.params.username!,
				packName: page.params.packName!,
				version: comment.pack.packVersion,
				commentId: comment.id,
			}) + "?/like"}
			method="post"
			use:enhance
		>
			<button type="submit" class="flex gap-1 hover:cursor-pointer">
				<ThumbsUp class={comment.likes.hasLiked ? "fill-green-500" : ""} />
				<p class="font-mono text-lg">{comment.likes.positive}</p>
			</button>
		</form>

		<!-- TODO: Use superforms. -->
		<form
			action={resolve("/@[username]/-[packName]/v[version]/comments/[commentId]", {
				username: page.params.username!,
				packName: page.params.packName!,
				version: comment.pack.packVersion,
				commentId: comment.id,
			}) + "?/dislike"}
			method="post"
			use:enhance
		>
			<!-- TODO: Get the form message here. -->
			<button type="submit" class="flex gap-1 hover:cursor-pointer">
				<ThumbsDown class={comment.likes.hasDisliked ? "fill-red-400" : ""} />
				<p class="font-mono text-lg">{comment.likes.negative}</p>
			</button>
		</form>

		{#if clientUser && packOwnerName === clientUser.username}
			{#if comment.heartedBy}
				<!-- TODO: Use superforms. -->
				<form
					action={resolve("/@[username]/-[packName]/v[version]/comments/[commentId]", {
						username: page.params.username!,
						packName: page.params.packName!,
						version: comment.pack.packVersion,
						commentId: comment.id,
					}) + "?/unheart"}
					method="post"
					use:enhance
				>
					<!-- TODO: Get the form message here. -->
					<button
						type="submit"
						class="flex hover:cursor-pointer"
						title={`Hearted by ${comment.heartedBy.username} <3`}
					>
						<!-- TODO: Add avatar. -->
						<div class="p-3.5 bg-white rounded-full h-min -mt-1"></div>
						<Heart class="-ml-4.5 mt-1 fill-rose-400" />
					</button>
				</form>
			{:else}
				<!-- TODO: Use superforms. -->
				<form
					action={resolve("/@[username]/-[packName]/v[version]/comments/[commentId]", {
						username: page.params.username!,
						packName: page.params.packName!,
						version: comment.pack.packVersion,
						commentId: comment.id,
					}) + "?/heart"}
					method="post"
					use:enhance
				>
					<!-- TODO: Get the form message here. -->
					<button type="submit" class="flex hover:cursor-pointer" title="Heart this comment">
						<HeartPlus />
					</button>
				</form>
			{/if}
		{:else if comment.heartedBy}
			<div class="flex" title={`Hearted by ${comment.heartedBy.username} <3`}>
				<!-- TODO: Add avatar. -->
				<div class="p-3.5 bg-white rounded-full h-min -mt-1"></div>
				<Heart class="-ml-4.5 mt-1 fill-rose-400" />
			</div>
		{/if}
	</div>
</div>
