<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import Badge from "$lib/components/badge.svelte";
	import Comment from "$lib/components/comment.svelte";
	import { satisfiesRole } from "$lib/user";
	import { Cog } from "lucide-svelte";
	import { superForm } from "sveltekit-superforms";

	let { data } = $props();
	const { form, errors, constraints, message, enhance } = $derived(superForm(data.form));

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
						<p class="text-gray-600">{dateFormat.format(new Date(message.creationDate))}</p>
					</div>
				{/each}
			</div>
		</details>
	</div>

	<!-- Comments -->
	<div class="flex flex-col gap-2 m-1 p-2 bg-header rounded-md">
		{#await data.commentsObject}
			<h3>Comments</h3>

			<p>Loading...</p>
		{:then commentsObject}
			<p>Comments ({commentsObject.amount})</p>

			<!-- Post Comment -->
			{#if data.user}
				<form action="?/post" method="post" class="flex flex-col gap-1 rounded-xl" use:enhance>
					{#if $message}<h3 class="text-red-500">{$message}</h3>{/if}
					{#if $errors._errors}
						{#each $errors._errors as error (error)}
							<span class="text-red-500 text-xl">{error}</span>
						{/each}
					{/if}

					<textarea
						name="text"
						placeholder="Comment..."
						class="rounded-xl resize h-24 bg-background target:outline"
						aria-invalid={$errors.text ? "true" : undefined}
						bind:value={$form.text}
						{...$constraints.text}
					></textarea>
					{#if $errors.text}<span class="text-red-500">{$errors.text}</span>{/if}

					<button
						type="submit"
						class="p-2 w-full rounded-md bg-indigo-500 hover:cursor-pointer hover:bg-indigo-400 active:bg-indigo-600"
					>
						Post
					</button>
				</form>
			{/if}

			<div class="flex flex-col gap-1">
				{#each commentsObject.comments as comment (comment.id)}
					<Comment {comment} clientUser={data.user} packOwnerName={versions.latest.ownerName} />
				{/each}
			</div>
		{/await}
	</div>
{/await}
