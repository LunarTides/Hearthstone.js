<script lang="ts">
	import { resolve } from "$app/paths";
	import type { CensoredGroup } from "$lib/group";
	import type { ClientUser } from "$lib/server/auth";
	import { satisfiesRole } from "$lib/user";
	import { Medal } from "lucide-svelte";

	let {
		group,
		clientUser,
	}: {
		group: CensoredGroup;
		clientUser: ClientUser;
	} = $props();

	const avatarPromise = import(`$lib/../../static/avatars/${group.username}.avif`).catch(() => {});
</script>

<div class="max-w-77.5">
	<a href={resolve("/@[username]", { username: group.username })}>
		<div class="p-4 rounded-xl transition-all bg-header hover:scale-105 hover:drop-shadow-2xl">
			<div class="flex flex-col gap-1">
				<div class="flex gap-2">
					{#await avatarPromise}
						<div class="p-6 bg-white rounded-full size-12"></div>
					{:then avatar}
						<img alt="Avatar" class="size-12" src={avatar.default.split("/static")[1]} />
					{/await}

					<div>
						<p class="text-xl self-center">{group.username}</p>

						{#if satisfiesRole(clientUser, "Moderator")}
							<div class="flex w-fit bg-background p-1 rounded-sm gap-0.5 *:self-center">
								<Medal size="16" class={group.karma >= 0 ? "text-yellow-300" : "text-red-400"} />
								<p>{group.karma}</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</a>
</div>
