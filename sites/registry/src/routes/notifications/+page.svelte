<script lang="ts">
	import { enhance } from "$app/forms";
	import { resolve } from "$app/paths";
	import { X } from "lucide-svelte";

	const { data } = $props();
</script>

{#if data.notifications && data.notifications.length > 0}
	<form action="?/clear" method="post" class="flex" use:enhance>
		<button type="submit" class="m-1 py-2 w-full custom-button"> Clear </button>
	</form>

	<div class="flex flex-col gap-1">
		{#each data.notifications as notification (notification.id)}
			<div class="mx-1 flex p-3 bg-header rounded-md outline md:max-h-12">
				{#if notification.route}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={notification.route}>{notification.text}</a>
				{:else}
					<p>{notification.text}</p>
				{/if}

				<div class="flex ml-auto gap-2">
					<p class="text-gray-500 text-xs md:text-base">
						{new Date(notification.date).toUTCString()}
					</p>
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
