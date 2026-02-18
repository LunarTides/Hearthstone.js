<script lang="ts">
	import { enhance } from "$app/forms";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import Badge from "$lib/components/badge.svelte";
	import { satisfiesRole } from "$lib/user";
	import { Cog, Heart, HeartPlus, ThumbsDown, ThumbsUp, Trash2 } from "lucide-svelte";

	let { data } = $props();

	let commentDeleteConfirm = $state("");

	let messagesOpen = $state(page.url.hash.startsWith("#message"));

	const dateFormat = new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour12: false,
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
</script>

<!-- Comments -->
{#await data.formattedPacks}
	<p>Loading...</p>
{:then versions}
	<!-- Messages -->
	<div class="m-1 p-2 bg-header rounded-md">
		<details bind:open={messagesOpen}>
			<summary>Messages ({versions.current.messages.length})</summary>

			<!-- TODO: Add posting messages as Moderator+ -->

			<div class="flex flex-col gap-1">
				{#each versions.current.messages as message (message.id)}
					<div
						id={`message-${message.id}`}
						class="flex flex-col gap-2 p-2 bg-background rounded-xl text-white target:outline"
					>
						<div>
							<div class="flex gap-2">
								{#if message.author}
									<a
										href={resolve("/@[username]", { username: message.author.username })}
										class="flex gap-2"
									>
										<!-- TODO: Add avatar -->
										<div class="p-4 bg-white rounded-full"></div>
										<p class="text-lg self-center font-mono">{message.author.username}</p>
									</a>
									<div class="flex gap-1">
										{#if message.username === data.user?.username}
											<Badge class="bg-indigo-300 h-fit self-center text-black">You</Badge>
										{/if}
										{#if satisfiesRole(message.author, "Moderator")}
											<Badge class="bg-blue-200 h-fit self-center text-black">
												{message.author.role}
											</Badge>
										{/if}
									</div>
									{#if message.type !== "public"}
										<p class="text-lg self-center font-mono bg-background py-0.5 px-2 rounded-full">
											{message.type[0].toUpperCase() + message.type.slice(1)}
										</p>
									{/if}
								{:else}
									<div class="flex gap-2">
										<Cog class="size-7" />
										<p class="text-lg self-center font-mono">System</p>
									</div>
									<Badge class="bg-indigo-400 h-fit self-center text-black">System</Badge>
								{/if}
							</div>
						</div>

						<pre class="font-sans">{message.text}</pre>
						<p class="text-gray-600">{dateFormat.format(message.creationDate)}</p>
					</div>
				{/each}
			</div>
		</details>
	</div>

	<!-- Comments -->
	<div class="m-1 p-2 bg-header rounded-md">
		{#await data.commentsObject}
			<h3>Comments</h3>

			<p>Loading...</p>
		{:then commentsObject}
			<p>Comments ({commentsObject.amount})</p>

			<!-- TODO: Use superforms. -->
			<form
				action={resolve("/@[username]/-[packName]/v[version]/[id]/comments", {
					username: page.params.username!,
					packName: page.params.packName!,
					version: page.params.version!,
					id: page.params.id!,
				}) + "?/post"}
				method="post"
				class="flex flex-col gap-1 rounded-xl my-2"
				use:enhance
			>
				<textarea
					id="comment-content"
					name="text"
					placeholder="Comment..."
					class="rounded-xl resize h-24 bg-background target:outline"
				></textarea>
				<button
					type="submit"
					id="comment-post"
					class="p-2 w-full rounded-md bg-indigo-500 hover:cursor-pointer hover:bg-indigo-400 active:bg-indigo-600"
					>Post</button
				>
			</form>

			<!-- TODO: The comments constantely reorder each other. -->
			<div class="flex flex-col gap-1">
				{#each commentsObject.comments as comment (comment.id)}
					<div
						id={`comment-${comment.id}`}
						class="flex flex-col gap-2 p-2 bg-background rounded-xl text-white target:outline"
					>
						<div>
							{#if comment.username === data.user?.username || satisfiesRole(data.user, "Moderator")}
								{#if commentDeleteConfirm === comment.id}
									<!-- TODO: Use superforms. -->
									<form
										action={resolve(
											"/@[username]/-[packName]/v[version]/[id]/comments/[commentId]",
											{
												username: page.params.username!,
												packName: page.params.packName!,
												version: comment.pack.packVersion,
												id: comment.pack.id,
												commentId: comment.id,
											},
										) + "?/delete"}
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

							<div class="flex gap-2">
								{#if comment.author}
									<a
										href={resolve("/@[username]", { username: comment.author.username })}
										class="flex gap-2"
									>
										<!-- TODO: Add avatar -->
										<div class="p-4 bg-white rounded-full"></div>
										<p class="text-lg self-center font-mono">{comment.author.username}</p>
									</a>
									<div class="flex gap-1">
										{#if comment.username === data.user?.username}
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

						<pre class="font-sans">{comment.text}</pre>
						<!-- TODO: `comment.creationDate` is a string for some reason? -->
						<p class="text-gray-600">{dateFormat.format(new Date(comment.creationDate))}</p>

						<!-- TODO: Get the form message here. -->
						<!-- {#if form?.message}<p class="text-red-500">{form.message}</p>{/if} -->
						<div class="flex gap-3">
							<!-- TODO: Use superforms. -->
							<form
								action={resolve(
									"/@[username]/-[packName]/v[version]/[id]/comments/[commentId]",
									{
										username: page.params.username!,
										packName: page.params.packName!,
										version: comment.pack.packVersion,
										id: comment.pack.id,
										commentId: comment.id,
									},
								) + "?/like"}
								method="post"
								use:enhance
							>
								<!-- TODO: These are glitchy on the card page. -->
								<button type="submit" class="flex gap-1 hover:cursor-pointer">
									<ThumbsUp class={comment.likes.hasLiked ? "fill-green-500" : ""} />
									<p class="font-mono text-lg">{comment.likes.positive}</p>
								</button>
							</form>

							<!-- TODO: Use superforms. -->
							<form
								action={resolve(
									"/@[username]/-[packName]/v[version]/[id]/comments/[commentId]",
									{
										username: page.params.username!,
										packName: page.params.packName!,
										version: comment.pack.packVersion,
										id: comment.pack.id,
										commentId: comment.id,
									},
								) + "?/dislike"}
								method="post"
								use:enhance
							>
								<!-- TODO: Get the form message here. -->
								<button type="submit" class="flex gap-1 hover:cursor-pointer">
									<ThumbsDown class={comment.likes.hasDisliked ? "fill-red-400" : ""} />
									<p class="font-mono text-lg">{comment.likes.negative}</p>
								</button>
							</form>

							{#if data.user && versions.latest.ownerName === data.user.username}
								{#if comment.heartedBy}
									<!-- TODO: Use superforms. -->
									<form
										action={resolve(
											"/@[username]/-[packName]/v[version]/[id]/comments/[commentId]",
											{
												username: page.params.username!,
												packName: page.params.packName!,
												version: comment.pack.packVersion,
												id: comment.pack.id,
												commentId: comment.id,
											},
										) + "?/unheart"}
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
										action={resolve(
											"/@[username]/-[packName]/v[version]/[id]/comments/[commentId]",
											{
												username: page.params.username!,
												packName: page.params.packName!,
												version: comment.pack.packVersion,
												id: comment.pack.id,
												commentId: comment.id,
											},
										) + "?/heart"}
										method="post"
										use:enhance
									>
										<!-- TODO: Get the form message here. -->
										<button
											type="submit"
											class="flex hover:cursor-pointer"
											title="Heart this comment"
										>
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
				{/each}
			</div>

			<!-- <pre>{JSON.stringify(comments, null, 4)}</pre> -->
		{/await}
	</div>
{/await}
