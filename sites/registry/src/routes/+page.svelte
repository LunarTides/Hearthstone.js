<script lang="ts">
	import { dev } from "$app/environment";
</script>

{#if dev}
	<h1>Hello, world!</h1>
{:else}
	<!-- TODO: Change when no longer relevant. -->
	<h1>
		The registry is not yet finished. Due to security reasons, creating accounts has been disabled.
		See <a
			href="https://github.com/LunarTides/Hearthstone.js/issues/446"
			class="text-blue-500 underline">this issue</a
		> for more information.
	</h1>
{/if}
