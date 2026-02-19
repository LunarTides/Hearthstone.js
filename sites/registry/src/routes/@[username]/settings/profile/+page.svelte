<script>
	import { rolesEnum } from "$lib/db/schema.js";
	import { satisfiesRole } from "$lib/user.js";
	import { superForm } from "sveltekit-superforms";

	let { data } = $props();

	const { form, errors, constraints, message, enhance } = $derived(superForm(data.form));
</script>

<form method="post" action="?/edit" class="flex flex-col gap-1 min-w-1/4" use:enhance>
	{#if $message}<h3 class="text-red-500">{$message}</h3>{/if}
	{#if $errors._errors}
		{#each $errors._errors as error (error)}
			<span class="text-red-500 text-xl">{error}</span>
		{/each}
	{/if}

	<label for="aboutMe">About me</label>
	<textarea
		name="aboutMe"
		class="bg-background min-h-52"
		aria-invalid={$errors.aboutMe ? "true" : undefined}
		bind:value={$form.aboutMe}
		{...$constraints.aboutMe}
	></textarea>
	{#if $errors.aboutMe}<span class="text-red-500">{$errors.aboutMe}</span>{/if}

	<label for="pronouns">Pronouns</label>
	<input
		name="pronouns"
		class="bg-background"
		aria-invalid={$errors.pronouns ? "true" : undefined}
		bind:value={$form.pronouns}
		{...$constraints.pronouns}
	/>
	{#if $errors.pronouns}<span class="text-red-500">{$errors.pronouns}</span>{/if}

	{#if satisfiesRole(data.user, "Admin")}
		<label for="role">Role</label>
		<select
			name="role"
			class="bg-background"
			aria-invalid={$errors.role ? "true" : undefined}
			bind:value={$form.role}
			{...$constraints.role}
		>
			{#each rolesEnum.enumValues as role (role)}
				<option value={role} selected={data.user.role === role}>{role}</option>
			{/each}
		</select>
		{#if $errors.role}<span class="text-red-500">{$errors.role}</span>{/if}
	{/if}

	<button class="custom-button p-2 rounded-none">Save</button>
</form>
