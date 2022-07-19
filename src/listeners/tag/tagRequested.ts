import { Listener } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import { TagModel } from '../../model/tag';

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
		if (!tag) return;
		const embed = new MessageEmbed()
			.setDescription(tag.content)
			.setColor('GREEN');
		await tag.updateOne({ uses: tag.uses + 1 }).exec();
		message.channel.send({ embeds: [embed] });
	}
}
