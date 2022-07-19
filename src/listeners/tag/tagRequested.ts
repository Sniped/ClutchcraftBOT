import { Listener } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import { TagModel } from '../../model/tag';
import { EMOJIS, IMGUR_LINK_REGEX } from '../../util/constants';

export class TagRequestedListener extends Listener {
	constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			event: 'unknownMessageCommand',
		});
	}

	// we only care about the message and the command name
	async run({
		message,
		commandName,
	}: {
		message: Message;
		commandName: string;
	}) {
		const tag = await TagModel.findByNameOrAlias(commandName.toLowerCase());
		if (!tag || !tag.result) return;
		if (
			this.container.client.tagCooldownManager.isOnCooldown(tag.result.name)
		) {
			await message.react(EMOJIS.STOPWATCH);
			return;
		}
		const matches = tag.result.content.match(IMGUR_LINK_REGEX);
		const embed = new MessageEmbed().setColor('GREEN').setFooter({
			text: `Requested by ${message.author.tag}`,
			iconURL: message.author.avatarURL()!,
		});
		let content = tag.result.content;
		if (matches) {
			const link = matches[0];
			content = tag.result.content.replace(link, '');
			embed.setImage(link);
		}
		embed.setDescription(content);
		await tag.result.updateOne({ uses: tag.result.uses + 1 }).exec();
		message.channel.send({ embeds: [embed] });
		this.container.client.tagCooldownManager.add(tag.result.name);
	}
}
