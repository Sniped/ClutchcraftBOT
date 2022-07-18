import { Listener } from '@sapphire/framework';
import { Client } from 'discord.js';

export class ReadyListener extends Listener {
	constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			once: true,
			event: 'ready',
		});
	}

	run(client: Client) {
		this.container.logger.info(`Successfully logged in on ${client.user!.tag}`);
	}
}
