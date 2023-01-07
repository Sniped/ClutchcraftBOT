export const IMGUR_LINK_REGEX =
	/((?:https?:)?\/\/(\w+\.)?imgur\.com\/(\S*)(\.[a-zA-Z]{3,}))/im;

export const WHITELISTED_GUILDS = [
	'975450713461235842', // ClutchCraft
	'990803271000133663', // ClutchCraft Staff
	'998720199073222676', // ClutchCraft Bot Development
];

export const EMOJIS = {
	WHITE_CHECK_MARK: '✅',
	X_MARK: '❌',
	WARNING: '⚠️',
	NAME_BADGE: '📛',
	STOPWATCH: '⏱️',
};

export const ONE_SECOND_MS = 1000;
export const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;

export const JOINS_ANNOUNCE_CHANNELS: { [key: string]: string } = {
	// ClutchCraft -> #welcomes
	'975450713461235842': '978517273994223646',
	// ClutchCraft Bot Testing -> #chat
	'998720199073222676': '998992636935417976'
};
