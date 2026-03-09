<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import Comment from "$lib/components/comment.svelte";
	import FileTree from "$lib/components/file-tree.svelte";
	import { HighlightAuto, LineNumbers } from "svelte-highlight";
	import { superForm } from "sveltekit-superforms";

	let { data } = $props();
	const { form, errors, constraints, message, enhance } = $derived(superForm(data.form));
</script>

{#await data.relevantFile}
	<p>Loading...</p>
{:then fileInfo}
	<div class="m-1 p-2 bg-header rounded-md">
		<p class="mb-2">Files ({fileInfo.tree?.children?.length ?? 0})</p>
		<FileTree files={fileInfo.tree?.children} />
	</div>

	{#if fileInfo.file.type === "file"}
		<div class="">
			<HighlightAuto
				code={fileInfo.file.content}
				languageNames={["typescript", "markdown", "json"]}
				let:highlighted
			>
				<LineNumbers {highlighted} wrapLines class="m-1 rounded-md" />
			</HighlightAuto>
		</div>
	{/if}
{/await}

<!-- Comments -->
<div class="flex flex-col gap-2 m-1 p-2 bg-header rounded-md">
	{#await data.commentsObject}
		<h3>Comments</h3>

		<p>Loading...</p>
	{:then commentsObject}
		<p>Comments ({commentsObject.amount})</p>

		<!-- Post Comment -->
		<!-- FIXME: This disappears when submitting for some reason. -->
		{#if data.user}
			<form
				action={resolve("/@[username]/-[packName]/v[version]/comments", {
					username: page.params.username!,
					packName: page.params.packName!,
					version: page.params.version!,
				}) + "?/post"}
				method="post"
				class="flex flex-col gap-1 rounded-xl"
				use:enhance
			>
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

				<input name="filePath" type="hidden" value={page.params.path} />

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
				<Comment {comment} clientUser={data.user} packOwnerName={page.params.username!} />
			{/each}
		</div>
	{/await}
</div>
