<script lang="ts">
	import { m } from "$lib/paraglide/messages.js";
	import { superForm } from "sveltekit-superforms";

	let { data } = $props();

	const { form, errors, constraints, message, enhance } = $derived(superForm(data.form));
</script>

<div class="fixed inset-0 w-fit h-fit m-auto">
	<form method="post" action="?/login" class="flex flex-col gap-1 w-lg text-center" use:enhance>
		{#if $message}<h3>{$message}</h3>{/if}
		{#if $errors._errors}
			{#each $errors._errors as error (error)}
				<span class="text-red-500 text-xl">{error}</span>
			{/each}
		{/if}

		<div class="bg-slate-500 flex flex-col gap-1 p-5 rounded-xl">
			<label for="username" class="text-xl font-bold">{m.neat_wise_falcon_conquer()}</label>
			<input
				name="username"
				class="rounded-lg"
				aria-invalid={$errors.username ? "true" : undefined}
				bind:value={$form.username}
				{...$constraints.username}
			/>
			{#if $errors.username}<span class="text-red-500">{$errors.username}</span>{/if}
		</div>

		<div class="bg-slate-500 flex flex-col gap-1 p-5 rounded-xl">
			<label for="password" class="text-xl font-bold">{m.large_teal_lobster_chop()}</label>
			<input
				type="password"
				name="password"
				class="rounded-lg"
				aria-invalid={$errors.password ? "true" : undefined}
				bind:value={$form.password}
				{...$constraints.password}
			/>
			{#if $errors.password}<span class="text-red-500">{$errors.password}</span>{/if}
		</div>

		<div class="flex gap-1 text-lg">
			<button
				class="w-full text-white px-4 py-2 rounded-lg bg-indigo-500 hover:cursor-pointer hover:bg-indigo-400 active:bg-indigo-600"
			>
				{m.muddy_fluffy_gibbon_prosper()}
			</button>
			<button
				formaction="?/register"
				class="w-full text-white px-4 py-2 rounded-lg bg-indigo-500 hover:cursor-pointer hover:bg-indigo-400 active:bg-indigo-600"
			>
				{m.polite_agent_hound_quiz()}
			</button>
		</div>
	</form>
</div>
