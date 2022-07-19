import { Listener } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { WHITELISTED_GUILDS } from '../util/constants';

export class GuildJoinListener extends Listener {
	constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			event: 'guildCreate',
		});
	}

	async run(guild: Guild) {
		if (!WHITELISTED_GUILDS.includes(guild.id)) {
			await guild.leave();
			this.container.logger.info(
				`Left unwhitelisted guild ${guild.name} (${guild.id})`
			);
		}
	}
}
