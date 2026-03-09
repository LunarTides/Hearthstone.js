<script lang="ts">
	import type { ClientUser } from "$lib/server/auth";
	import type { GroupAndProfile } from "$lib/group";
	import Avatar from "./avatar.svelte";

	let {
		group,
		clientUser,
	}: {
		group: GroupAndProfile;
		clientUser: ClientUser;
	} = $props();
</script>

<div class="flex gap-1">
	<div class="p-3 bg-header text-white w-full rounded-lg">
		<div class="flex flex-col gap-1">
			<div class="flex gap-2">
				<Avatar username={group.username} />

				<p class="text-xl self-center">{group.username}</p>
			</div>

			<pre class="text-wrap wrap-break-word">{group.profile.aboutMe}</pre>
		</div>
	</div>
</div>
