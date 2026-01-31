<script>
	import { superForm } from "sveltekit-superforms";

	let { data } = $props();

	const { form, errors, constraints, message, enhance } = $derived(superForm(data.form));
</script>

<form method="post" class="flex flex-col gap-1 w-fit" use:enhance>
	{#if $message}<h3 class="text-red-500">{$message}</h3>{/if}
	{#if $errors._errors}
		{#each $errors._errors as error (error)}
			<span class="text-red-500 text-xl">{error}</span>
		{/each}
	{/if}

	<label for="username">Username</label>
	<input
		name="username"
		class="bg-background"
		aria-invalid={$errors.username ? "true" : undefined}
		bind:value={$form.username}
		{...$constraints.username}
	/>
	{#if $errors.username}<span class="text-red-500">{$errors.username}</span>{/if}

	<button class="custom-button p-2 rounded-none">Invite</button>
</form>
