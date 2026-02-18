<script lang="ts">
	let { children } = $props();
</script>

<nav>
	<div class="flex gap-1 m-1">
		{@render children()}
	</div>
</nav>
