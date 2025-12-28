<script lang="ts">
	import { enhance } from "$app/forms";
	import type { Setting } from "$lib/db/schema.js";
	import { Cog } from "lucide-svelte";
	import { onMount } from "svelte";

	const { data } = $props();

	let settings: Setting[] = $state([]);
	onMount(async () => {
		const raw = await data.settings;
		settings = raw.toSorted((a, b) => a.key.localeCompare(b.key));
	});
</script>

{#if settings.length > 0}
	<table>
		<thead class="text-left">
			<tr>
				<th>Key</th>
				<th>Description</th>
				<th>Value</th>
			</tr>
		</thead>
		<tbody>
			{#each settings as setting, i (i)}
				<tr>
					<td
						><input
							bind:value={setting.key}
							class="bg-inherit drop-shadow-slate-600 drop-shadow-md border-0 font-mono p-1 w-60"
						/></td
					>
					<td
						><input
							bind:value={setting.description}
							class="bg-inherit drop-shadow-slate-600 drop-shadow-md border-0 p-1 w-5xl"
						/></td
					>
					<td>
						{#if typeof setting.value === "boolean"}
							<select
								id={`value-${i}`}
								class="rounded-md w-full"
								onchange={(event) => {
									const v = event.currentTarget.value;
									setting.value = v === "true";

									if (v === "other") {
										setting.value = "";
										setTimeout(() => {
											document.getElementById(`value-${i}`)?.focus();
										}, 0);
									}
								}}
							>
								<option value={true} selected={setting.value}>true</option>
								<option value={false} selected={!setting.value}>false</option>
								<option value="other">Other...</option>
							</select>
						{:else if typeof setting.value === "number"}
							<input
								type="number"
								id={`value-${i}`}
								class="rounded-md"
								defaultValue={setting.value}
								oninput={(event) => {
									setting.value = parseInt(event.currentTarget.value, 10) || "";

									setTimeout(() => {
										document.getElementById(`value-${i}`)?.focus();
									}, 0);
								}}
							/>
						{:else}
							<input
								id={`value-${i}`}
								class="rounded-md"
								defaultValue={setting.value === "" ? "" : JSON.stringify(setting.value)}
								oninput={(event) => {
									const v = event.currentTarget.value;
									let parsed = v;

									try {
										parsed = JSON.parse(v);
									} catch {}
									console.log(typeof parsed);
									if (["boolean", "number"].includes(typeof parsed)) {
										setting.value = parsed;
										return;
									}

									setting.value = parsed;
								}}
							/>
						{/if}
					</td>
				</tr>
			{/each}
			<tr
				class="cursor-copy"
				onclick={() => {
					settings = [
						...settings,
						{
							key: "change.me",
							description: "",
							value: "",
						},
					];
				}}
			>
				<td><p class="p-1 text-gray-600">Key...</p></td>
				<td><p class="p-1 text-gray-600">Description...</p></td>
				<td><p class="p-1 text-gray-600">Value...</p></td>
			</tr>
		</tbody>
	</table>

	<form action="?/save" method="post" use:enhance>
		<input type="hidden" name="settings" value={JSON.stringify(settings)} />
		<button
			type="submit"
			class="flex gap-1 w-full py-2 justify-center mt-4 text-white bg-indigo-400 hover:cursor-pointer hover:bg-indigo-300 active:bg-indigo-500"
		>
			<Cog />
			Save
		</button>
	</form>

	<div class="p-2 bg-slate-500 mt-4 rounded-xl">
		<p class="font-bold text-2xl">Raw</p>
		<pre>{JSON.stringify(settings, null, 4)}</pre>
	</div>
{:else}
	<p>Loading…</p>
{/if}
