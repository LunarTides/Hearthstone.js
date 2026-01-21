<script lang="ts">
	import { resolve } from "$app/paths";
	import { superForm } from "sveltekit-superforms";

	let { data } = $props();

	const { form, errors, constraints, message, enhance } = $derived(superForm(data.form));
</script>

<div class="fixed inset-0 w-fit h-fit m-auto flex gap-1">
	<form method="post" action="?/login" class="flex flex-col gap-1 w-lg text-center" use:enhance>
		{#if $message}<h3 class="text-red-500">{$message}</h3>{/if}
		{#if $errors._errors}
			{#each $errors._errors as error (error)}
				<span class="text-red-500 text-xl">{error}</span>
			{/each}
		{/if}

		<div class="bg-header flex flex-col gap-1 p-5 rounded-xl">
			<label for="username" class="text-xl font-bold">Username</label>
			<input
				name="username"
				class="rounded-lg bg-background"
				aria-invalid={$errors.username ? "true" : undefined}
				bind:value={$form.username}
				{...$constraints.username}
			/>
			{#if $errors.username}<span class="text-red-500">{$errors.username}</span>{/if}
		</div>

		<div class="bg-header flex flex-col gap-1 p-5 rounded-xl">
			<label for="password" class="text-xl font-bold">Password</label>
			<input
				type="password"
				name="password"
				class="rounded-lg bg-background"
				aria-invalid={$errors.password ? "true" : undefined}
				bind:value={$form.password}
				{...$constraints.password}
			/>
			{#if $errors.password}<span class="text-red-500">{$errors.password}</span>{/if}
		</div>

		<p class="text-nowrap self-center">
			By creating an account, you agree to the
			<a href={resolve("/terms")} class="underline">Terms of Service</a>
			and the
			<a href={resolve("/privacy")} class="underline">Privacy Policy</a>.
		</p>

		<div class="flex gap-1 text-lg">
			<button class="custom-button w-full px-4 py-2">Login</button>
			<button formaction="?/register" class="custom-button w-full px-4 py-2">Register</button>
		</div>
	</form>
</div>
