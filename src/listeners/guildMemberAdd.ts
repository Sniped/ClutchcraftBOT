import { Listener } from '@sapphire/framework';
import type { GuildMember, TextChannel } from 'discord.js';
import { JOINS_ANNOUNCE_CHANNELS } from '../util/constants';

export class GuildMemberAddListener extends Listener {
	constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			event: 'guildMemberAdd',
		});
	}

	async run(member: GuildMember) {
		const welcomeChannelId = JOINS_ANNOUNCE_CHANNELS[member.guild.id];
		if (!welcomeChannelId) return;
		const welcomeChannel = member.guild.channels.resolve(welcomeChannelId);
		if (!welcomeChannel || welcomeChannel.type != 'GUILD_TEXT') return;
		await (welcomeChannel as TextChannel).send(`Hey ${member.user}, welcome to **ClutchCraft**!`);
	}
}