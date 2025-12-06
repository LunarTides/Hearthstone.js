import { error } from '@sveltejs/kit';
import fs from 'fs/promises';

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const file = formData.get('file');
		if (!file) {
			return;
		}

		if (!(file instanceof File)) {
			return;
		}

		if (
			![
				'application/zip',
				'application/x-zip-compressed',
				'application/x-7z-compressed',
				'application/x-tar'
			].includes(file.type)
		) {
			error(400, { message: 'Invalid file type.' });
		}

		await fs.writeFile(`./static/assets/hold/${file.name}`, await file.text());
	}
};
