import { error } from "@sveltejs/kit";
import fs from "fs/promises";

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const query = formData.get("query");
		if (!query) {
			return;
		}

		await fs.read;

		if (!(file instanceof File)) {
			return;
		}

		if (
			![
				"application/zip",
				"application/x-zip-compressed",
				"application/x-7z-compressed",
				"application/x-tar",
			].includes(file.type)
		) {
			error(415, { message: "Invalid file type." });
		}

		if (file.size > 10_000_000) {
			error(413, { message: "Upload too large." });
		}

		const stream = await file.stream().getReader().read();
		await fs.writeFile(`./static/assets/held/${file.name}`, stream.value);
	},
};
