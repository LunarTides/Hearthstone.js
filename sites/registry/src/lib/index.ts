// place files you want to import through the `$lib` alias in this folder.

export function exclude<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
	const returnValue = {} as T;

	for (const [key, value] of Object.entries(obj)) {
		if (keys.includes(key as K)) {
			continue;
		}

		(returnValue as any)[key] = value;
	}

	return returnValue;
}
