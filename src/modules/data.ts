export const data = {
	/**
	 * Removes `element` from `list`.
	 *
	 * @param list The list to remove from
	 * @param element The element to remove from the list
	 *
	 * @returns Success
	 */
	remove<T>(list: T[], element: T): boolean {
		if (!list.includes(element)) {
			return false;
		}

		list.splice(list.indexOf(element), 1);
		return true;
	},

	/**
	 * Align columns by padding them with spaces.
	 *
	 * This function takes a list of strings and pads them with spaces to make them the same length.
	 *
	 * @param columns The columns to align
	 * @param sep The seperator. Only the left side of the seperator will be padded
	 *
	 * @example
	 * const columns = [];
	 * columns.push('Example - Example');
	 * columns.push('Test - Hello World');
	 * columns.push('This is the longest - Short');
	 * columns.push('Tiny - This is even longer then that one!');
	 *
	 * const alignedColumns = alignColumns(columns, "-");
	 *
	 * for (const alignedColumn of alignedColumns) {
	 *     console.log(alignedColumn);
	 * }
	 * // Example             - Example
	 * // Test                - Hello World
	 * // This is the longest - Short
	 * // Tiny                - This is even longer then that one!
	 *
	 * assert.equal(alignedColumns, ["Example             - Example", "Test                - Hello World", "This is the longest - Short", "Tiny                - This is even longer then that one!"]);
	 *
	 * @returns The aligned columns
	 */
	alignColumns(columns: string[], sep: string): string[] {
		// Find the longest column, most characters to the left of the seperator.
		let longestColumn: [string, number] = ["", Number.NEGATIVE_INFINITY];

		for (const column of columns) {
			const columnSplit = column.split(sep);

			const columnLength = game.color.stripAll(columnSplit[0]).length;
			if (columnLength <= longestColumn[1]) {
				continue;
			}

			longestColumn = [column, columnLength];
		}

		const alignedColumns: string[] = [];

		for (const column of columns) {
			const columnSplit = column.split(sep);
			const difference =
				longestColumn[1] - game.color.stripAll(columnSplit[0]).length;

			const alignedColumn = `${columnSplit[0]}${" ".repeat(difference)}${sep}${game.lodash.tail(columnSplit).join(sep)}`;
			alignedColumns.push(alignedColumn);
		}

		return alignedColumns;
	},
};
