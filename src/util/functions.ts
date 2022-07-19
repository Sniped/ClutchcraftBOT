export function prettyDate(date: Date) {
	if (date.getTime() == -1 || !isValidDate(date)) return 'N/A';
	const time = Math.round(date.getTime() / 1000);
	return `<t:${time}>`
}

export function isValidDate(date: Date) {
	return date instanceof Date && !isNaN(date.valueOf());
}