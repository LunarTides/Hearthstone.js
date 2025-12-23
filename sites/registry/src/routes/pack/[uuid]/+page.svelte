<script lang="ts">
	import PackBig from "$lib/components/pack-big.svelte";
	import CardSmall from "$lib/components/card-small.svelte";
	import { resolve } from "$app/paths";
	import Badge from "$lib/components/badge.svelte";
	import { satisfiesRole } from "$lib/user.js";
	import { enhance } from "$app/forms";
	import { Heart, HeartPlus, ThumbsDown, ThumbsUp, Trash2 } from "lucide-svelte";
	import { page } from "$app/state";

	let { data, form } = $props();

	let deleteConfirm = $state<string | null>(null);
</script>

{#await data.packs}
	<!-- TODO: Replace with spinner. -->
	<p>Loading...</p>
{:then packs}
	{#await data.cards}
		<p>Loading...</p>
	{:then cards}
		<PackBig {packs} cards={{ all: cards }} user={data.user} {form} />

		<div class="m-2 p-5 bg-slate-600 rounded-xl">
			<details open>
				<summary class="text-lg text-white">Cards ({cards.length})</summary>
				<div class="flex flex-wrap gap-1 mt-2">
					{#each cards as card (card.id)}
						<CardSmall {card} pack={packs.latest} />
					{/each}
				</div>
			</details>
		</div>
	{/await}

	<!-- <pre>{JSON.stringify(packs, null, 4)}</pre> -->

	<!-- <hr /> -->

	<div class="m-2 p-5 bg-slate-600 rounded-xl">
		{#await data.commentsObject}
			<h2 class="text-lg font-medium mb-4 text-white">Comments</h2>

			<p>Loading...</p>
		{:then commentsObject}
			<h2 class="text-lg font-medium mb-4 text-white">Comments ({commentsObject.amount})</h2>

			<!-- TODO: Use superforms. -->
			<form
				action={resolve("/pack/[uuid]/comments", { uuid: page.params.uuid! }) + "?/post"}
				method="post"
				class="flex flex-col gap-1 p-2 rounded-xl bg-slate-400 mb-2"
				use:enhance
			>
				<textarea name="text" placeholder="Comment..." class="rounded-xl resize h-24"></textarea>
				<button
					type="submit"
					class="bg-indigo-500 rounded-full p-1 text-white hover:cursor-pointer hover:bg-indigo-400 active:bg-indigo-600"
				>
					Post
				</button>
			</form>

			<!-- TODO: The comments constantely reorder each other. -->
			{#each commentsObject.comments as comment (comment.id)}
				<div class="flex flex-col gap-2 m-1 p-2 bg-slate-500 rounded-xl text-white">
					<div>
						{#if comment.authorId === data.user?.id || satisfiesRole(data.user, "Moderator")}
							{#if deleteConfirm === comment.id}
								<!-- TODO: Use superforms. -->
								<form
									action={resolve("/pack/[uuid]/comments/[commentId]", {
										uuid: page.params.uuid!,
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
									onclick={() => (deleteConfirm = comment.id)}
								>
									<Trash2 />
								</button>
							{/if}
						{/if}

						<div class="flex gap-2">
							<a href={resolve("/user/[uuid]", { uuid: comment.author.id })} class="flex gap-2">
								<!-- TODO: Add avatar -->
								<div class="p-4 bg-white rounded-full"></div>
								<p class="text-lg self-center font-mono">{comment.author.username}</p>
							</a>
							{#if satisfiesRole(comment.author, "Moderator")}
								<Badge class="bg-yellow-300 h-fit self-center text-black">
									{comment.author.role}
								</Badge>
							{/if}
						</div>
					</div>

					<pre class="text-black font-sans">{comment.text}</pre>

					<!-- TODO: Get the form message here. -->
					{#if form?.message}<p class="text-red-500">{form.message}</p>{/if}
					<div class="flex gap-4">
						<!-- TODO: Use superforms. -->
						<form
							action={resolve("/pack/[uuid]/comments/[commentId]", {
								uuid: packs.latest.uuid,
								commentId: comment.id,
							}) + "?/like"}
							method="post"
							use:enhance
						>
							<!-- TODO: These are glitchy on the card page. -->
							<button type="submit" class="flex gap-1 mt-4 hover:cursor-pointer">
								<ThumbsUp class={comment.likes.hasLiked ? "fill-green-400" : ""} />
								<p class="font-mono text-lg">{comment.likes.positive}</p>
							</button>
						</form>

						<!-- TODO: Use superforms. -->
						<form
							action={resolve("/pack/[uuid]/comments/[commentId]", {
								uuid: packs.latest.uuid,
								commentId: comment.id,
							}) + "?/dislike"}
							method="post"
							use:enhance
						>
							<!-- TODO: Get the form message here. -->
							<button type="submit" class="flex gap-1 mt-4 hover:cursor-pointer">
								<ThumbsDown class={comment.likes.hasDisliked ? "fill-red-400" : ""} />
								<p class="font-mono text-lg">{comment.likes.negative}</p>
							</button>
						</form>

						{#if data.user && packs.latest.userIds.includes(data.user.id)}
							{#if comment.heartedBy}
								<!-- TODO: Use superforms. -->
								<form
									action={resolve("/pack/[uuid]/comments/[commentId]", {
										uuid: packs.latest.uuid,
										commentId: comment.id,
									}) + "?/unheart"}
									method="post"
									use:enhance
								>
									<!-- TODO: Get the form message here. -->
									<button
										type="submit"
										class="flex mt-4 hover:cursor-pointer"
										title={`Hearted by ${comment.heartedBy.username} <3`}
									>
										<div class="p-3.5 bg-white rounded-full h-min -mt-1"></div>
										<Heart class="-ml-4.5 mt-1 fill-rose-400" />
									</button>
								</form>
							{:else}
								<!-- TODO: Use superforms. -->
								<form
									action={resolve("/pack/[uuid]/comments/[commentId]", {
										uuid: packs.latest.uuid,
										commentId: comment.id,
									}) + "?/heart"}
									method="post"
									use:enhance
								>
									<!-- TODO: Get the form message here. -->
									<button
										type="submit"
										class="flex mt-4 hover:cursor-pointer"
										title="Heart this comment"
									>
										<HeartPlus />
									</button>
								</form>
							{/if}
						{:else if comment.heartedBy}
							<div class="flex mt-4" title={`Hearted by ${comment.heartedBy.username} <3`}>
								<div class="p-3.5 bg-white rounded-full h-min -mt-1"></div>
								<Heart class="-ml-4.5 mt-1 fill-rose-400" />
							</div>
						{/if}
					</div>
				</div>
			{/each}

			<!-- <pre>{JSON.stringify(comments, null, 4)}</pre> -->
		{/await}
	</div>
{/await}
