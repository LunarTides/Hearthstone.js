// https://easings.net/
export const easingFunctions = {
	linear: (x: number) => x,

	// Sine
	sineIn: (x: number) => 1 - Math.cos((x * Math.PI) / 2),
	sineOut: (x: number) => Math.sin((x * Math.PI) / 2),
	sineInOut: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,

	// Quad
	quadIn: (x: number) => x * x,
	quadOut: (x: number) => 1 - (1 - x) * (1 - x),
	quadInOut: (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2),

	// Cubic
	cubicIn: (x: number) => x * x * x,
	cubicOut: (x: number) => 1 - (1 - x) ** 3,
	cubicInOut: (x: number) =>
		x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2,

	// Quart
	quartIn: (x: number) => x * x * x * x,
	quartOut: (x: number) => 1 - (1 - x) ** 4,
	quartInOut: (x: number) =>
		x < 0.5 ? 8 * x * x * x * x : 1 - (-2 * x + 2) ** 4 / 2,

	// Quint
	quintIn: (x: number) => x * x * x * x * x,
	quintOut: (x: number) => 1 - (1 - x) ** 5,
	quintInOut: (x: number) =>
		x < 0.5 ? 16 * x * x * x * x * x : 1 - (-2 * x + 2) ** 5 / 2,

	// Expo
	expoIn: (x: number) => (x === 0 ? 0 : 2 ** (10 * x - 10)),
	expoOut: (x: number) => (x === 1 ? 1 : 1 - 2 ** (-10 * x)),
	expoInOut: (x: number) =>
		x === 0
			? 0
			: x === 1
				? 1
				: x < 0.5
					? 2 ** (20 * x - 10) / 2
					: (2 - 2 ** (-20 * x + 10)) / 2,

	// Circ
	circIn: (x: number) => 1 - Math.sqrt(1 - x ** 2),
	circOut: (x: number) => Math.sqrt(1 - (x - 1) ** 2),
	circInOut: (x: number) =>
		x < 0.5
			? (1 - Math.sqrt(1 - (2 * x) ** 2)) / 2
			: (Math.sqrt(1 - (-2 * x + 2) ** 2) + 1) / 2,

	// Back
	backIn: (x: number) => {
		const c1 = 1.70158;
		const c3 = c1 + 1;

		return c3 * x * x * x - c1 * x * x;
	},
	backOut: (x: number) => {
		const c1 = 1.70158;
		const c3 = c1 + 1;

		return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
	},
	backInOut: (x: number) => {
		const c1 = 1.70158;
		const c2 = c1 * 1.525;

		return x < 0.5
			? ((2 * x) ** 2 * ((c2 + 1) * 2 * x - c2)) / 2
			: ((2 * x - 2) ** 2 * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
	},

	// Elastic
	elasticIn: (x: number) => {
		const c4 = (2 * Math.PI) / 3;

		return x === 0
			? 0
			: x === 1
				? 1
				: -(2 ** (10 * x - 10)) * Math.sin((x * 10 - 10.75) * c4);
	},
	elasticOut: (x: number) => {
		const c4 = (2 * Math.PI) / 3;

		return x === 0
			? 0
			: x === 1
				? 1
				: 2 ** (-10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
	},
	elasticInOut: (x: number) => {
		const c5 = (2 * Math.PI) / 4.5;

		return x === 0
			? 0
			: x === 1
				? 1
				: x < 0.5
					? -(2 ** (20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
					: (2 ** (-20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
	},

	// Bounce
	bounceIn: (x: number) => 1 - easingFunctions.bounceOut(1 - x),
	bounceOut: (x: number) => {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			x -= 1.5;
			return n1 * (x / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			x -= 2.25;
			return n1 * (x / d1) * x + 0.9375;
		} else {
			x -= 2.625;
			return n1 * (x / d1) * x + 0.984375;
		}
	},
	bounceInOut: (x: number) => {
		return x < 0.5
			? (1 - easingFunctions.bounceOut(1 - 2 * x)) / 2
			: (1 + easingFunctions.bounceOut(2 * x - 1)) / 2;
	},
};
