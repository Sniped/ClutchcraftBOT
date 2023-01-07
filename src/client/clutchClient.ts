import { SapphireClient } from '@sapphire/framework';
import mongoose from 'mongoose';
import { CooldownManager } from '../structure/cooldownManager';
import { ONE_MINUTE_MS } from '../util/constants';
import type { ClutchClientOptions } from './clutchClientOptions';

export class ClutchClient extends SapphireClient {
	clutchClientOptions: ClutchClientOptions;
	tagCooldownManager: CooldownManager;

	constructor(clutchClientOptions: ClutchClientOptions) {
		super({
			intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS'],
			loadMessageCommandListeners: true,
			defaultPrefix: '!',
			disableMentionPrefix: true,
		});

		this.clutchClientOptions = clutchClientOptions;
		this.tagCooldownManager = new CooldownManager(ONE_MINUTE_MS);
	}

	async connectToMongo() {
		return await mongoose.connect(this.clutchClientOptions.mongoUri);
	}

	async start(token: string) {
		await this.connectToMongo();
		await this.login(token);
	}
}

declare module '@sapphire/framework' {
	interface SapphireClient {
		clutchClientOptions: ClutchClientOptions;
		tagCooldownManager: CooldownManager;
	}
}
