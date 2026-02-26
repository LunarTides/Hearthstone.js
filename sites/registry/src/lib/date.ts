export const dateFormat = new Intl.DateTimeFormat("en-US", {
	day: "2-digit",
	month: "long",
	year: "numeric",
	hour12: false,
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
});
