<script lang="ts">
	import { enhance } from "$app/forms";
	import { resolve } from "$app/paths";
	import { X } from "lucide-svelte";

	const { data } = $props();
</script>

{#if data.notifications && data.notifications.length > 0}
	<form action="?/clear" method="post" class="flex" use:enhance>
		<button
			type="submit"
			class="m-1 py-2 w-full bg-indigo-400 text-white rounded-full hover:cursor-pointer hover:bg-indigo-300 active:bg-indigo-500"
			>Clear</button
		>
	</form>

	<div class="flex flex-col gap-1">
		{#each data.notifications as notification (notification.id)}
			<div class="flex p-3 bg-blue-300 rounded-xl outline max-h-12">
				{#if notification.route}
					<a href={notification.route}>{notification.text}</a>
				{:else}
					<p>{notification.text}</p>
				{/if}

				<div class="flex ml-auto gap-2">
					<p>{new Date(notification.date).toUTCString()}</p>
					<form
						action={resolve("/notifications/[uuid]", { uuid: notification.id }) + "?/delete"}
						method="post"
						use:enhance
					>
						<button type="submit" class="hover:cursor-pointer">
							<X class="size-6 text-gray-500" />
						</button>
					</form>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<p>No notifications.</p>
{/if}

<!-- <pre>{JSON.stringify(data.notifications, null, 4)}</pre> -->
