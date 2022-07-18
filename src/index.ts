import { ClutchClient } from './client/clutchClient';

require('dotenv').config();

(async () => {
	const clutchClient = new ClutchClient({
		mongoUri: process.env.MONGO_URI || '',
	});

	await clutchClient.start(process.env.DISCORD_TOKEN || '');
})();
