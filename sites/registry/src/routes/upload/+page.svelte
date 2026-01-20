<script lang="ts">
	import { resolve } from "$app/paths";
</script>

<p>Upload</p>

<!-- TODO: Use superforms. -->
<form method="post" enctype="multipart/form-data" class="flex flex-col gap-1">
	<input name="file" type="file" accept=".tar.gz" />

	<div class="p-2 mx-1 bg-header w-fit rounded-md">
		<div class="flex gap-1">
			<p>Want to upload a pack?</p>
			<a href={resolve("/upload/rules")} class="underline">Check out the rules.</a>
		</div>

		<p>Dont worry, they are easily understandable :)</p>
	</div>

	<button type="submit" class="custom-button w-fit p-2">Submit</button>
</form>
