<script lang="ts">
	let { children } = $props();
</script>

<nav>
	<div class="flex flex-col gap-1 m-1 md:flex-row">
		{@render children()}
	</div>
</nav>
