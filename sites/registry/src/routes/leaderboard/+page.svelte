<script lang="ts">
	import { resolve } from "$app/paths";
	import { Medal } from "lucide-svelte";

	const { data } = $props();
</script>

{#await data.leaderboard}
	<p>Loading...</p>
{:then leaderboard}
	<table class="w-full text-lg">
		<thead>
			<tr class="alternating-children text-left">
				<th>Position</th>
				<th>Username</th>
				<th>Karma</th>
			</tr>
		</thead>
		<tbody>
			{#each leaderboard as user (user.username)}
				<tr class="alternating-children">
					<td>{leaderboard.indexOf(user) + 1}</td>
					<td>
						<a
							href={resolve("/@[username]", { username: user.username })}
							class="underline text-blue-500"
						>
							{user.username}
						</a>
					</td>
					<td class="flex gap-1">
						<Medal size="16" class="self-center text-yellow-300" />
						<p
							class={user.karma <= -1000
								? "text-red-600"
								: user.karma < 0
									? "text-red-400"
									: user.karma >= 1000000
										? "text-yellow-400 font-bold"
										: user.karma >= 100000
											? "text-indigo-500"
											: user.karma >= 10000
												? "text-blue-400"
												: user.karma >= 1000
													? "text-green-400"
													: ""}
						>
							{user.karma}
						</p>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/await}
