import { data } from "@Game/modules/data.ts";
import { describe, expect, test } from "bun:test";

describe("src/modules/data", () => {
	test("remove", async () => {
		const list = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];

		data.remove(list, 3);

		/*
		 * One 3 should be removed, not both.
		 * This is why it exists, instead of using lodash.remove
		 */
		expect(list).toEqual([1, 1, 2, 2, 3, 4, 4, 5, 5]);
	});

	test("alignColumns", async () => {
		const columns = [
			"Example - Example",
			"Test - Hello World",
			"This is the longest - Short",
			"Tiny - This is even longer then that one!",
		];

		const alignedColumns = data.alignColumns(columns, "-");

		expect(alignedColumns).toEqual([
			"Example             - Example",
			"Test                - Hello World",
			"This is the longest - Short",
			"Tiny                - This is even longer then that one!",
		]);
	});
});
