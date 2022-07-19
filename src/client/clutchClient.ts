import { SapphireClient } from '@sapphire/framework';
import mongoose from 'mongoose';
import type { ClutchClientOptions } from './clutchClientOptions';

export class ClutchClient extends SapphireClient {
	clutchClientOptions: ClutchClientOptions;

	constructor(clutchClientOptions: ClutchClientOptions) {
		super({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

		this.clutchClientOptions = clutchClientOptions;
	}

	async connectToMongo() {
		return await mongoose.connect(this.clutchClientOptions.mongoUri);
	}

	async start(token: string) {
		await this.connectToMongo();
		await this.login(token);
	}
}
