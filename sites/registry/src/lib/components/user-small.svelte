<script lang="ts">
	import { resolve } from "$app/paths";
	import { satisfiesRole, type UserAndProfile } from "$lib/user";
	import { SquarePen } from "lucide-svelte";
	import Badge from "./badge.svelte";
	import { fly } from "svelte/transition";
	import { rolesEnum } from "$lib/db/schema";
	import type { ClientUser } from "$lib/server/auth";
	import { enhance } from "$app/forms";

	let {
		user,
		loggedInUser,
	}: {
		user: UserAndProfile;
		loggedInUser: ClientUser;
	} = $props();

	let edit = $state(false);
</script>

<div class="flex gap-1">
	<div class="p-3 bg-slate-400 text-white w-fit rounded-lg">
		<div class="flex float-right gap-1">
			{#if user.id === loggedInUser?.id || satisfiesRole(user, "Admin")}
				<button onclick={() => (edit = true)} class="self-center hover:cursor-pointer">
					<SquarePen />
				</button>
			{/if}
		</div>

		<div>
			<div class="flex gap-2">
				<div class="p-6 bg-white rounded-full"></div>
				<p class="text-xl self-center">{user.username}</p>

				{#if user.profile.pronouns}
					<p class="text-sm text-slate-200 self-center min-w-full mr-8">
						({user.profile.pronouns})
					</p>
				{/if}
			</div>

			<pre>{user.profile.aboutMe}</pre>

			{#if satisfiesRole(user, "Moderator")}
				<Badge class="bg-blue-200 text-slate-600">{user.role}</Badge>
			{/if}
		</div>
	</div>

	{#if edit}
		<!-- TODO: Use superforms. -->
		<form
			action={resolve("/user/[uuid]", { uuid: user.id }) + "?/edit"}
			method="post"
			in:fly={{ x: -300, duration: 300 }}
			use:enhance
		>
			<div class="p-3 bg-slate-400 text-black w-fit rounded-lg">
				<div class="flex flex-col gap-1">
					<div class="flex gap-1">
						<!-- TODO: Add changing avatars. -->
						<div class="p-4 bg-white rounded-full not-hover:text-white">
							<SquarePen />
						</div>
						<input
							class="text-xl bg-slate-200 rounded-full self-center"
							placeholder="Username"
							defaultValue={user.username}
							name="username"
						/>

						{#if user.profile.pronouns}
							<input
								class="text-sm bg-slate-200 rounded-full self-center"
								placeholder="Pronouns"
								defaultValue={user.profile.pronouns}
								name="pronouns"
							/>
						{/if}
					</div>

					<textarea
						class="min-h-24 rounded-lg"
						name="aboutMe"
						placeholder="About me..."
						defaultValue={user.profile.aboutMe}>{user.profile.aboutMe}</textarea
					>

					{#if satisfiesRole(loggedInUser, "Admin")}
						<select class="rounded-full" name="role">
							{#each rolesEnum.enumValues as role (role)}
								<option value={role} selected={user.role === role}>{role}</option>
							{/each}
						</select>
					{/if}

					<div class="flex gap-1 text-center">
						<button
							type="submit"
							class="p-2 px-4 w-full rounded-full bg-green-300 hover:cursor-pointer hover:bg-green-200 active:bg-green-400"
							onclick={() => (edit = true)}
						>
							Save
						</button>
						<button
							type="button"
							class="p-2 px-4 w-full rounded-full bg-amber-400 hover:cursor-pointer hover:bg-amber-300 active:bg-amber-500"
							onclick={() => (edit = false)}
						>
							Cancel
						</button>
						<a
							href={resolve("/user/[uuid]/delete", { uuid: user.id })}
							class="p-2 px-4 w-full rounded-full bg-red-400 hover:cursor-pointer hover:bg-red-300 active:bg-red-500"
						>
							Delete
						</a>
					</div>
				</div>
			</div>
		</form>
	{/if}
</div>
