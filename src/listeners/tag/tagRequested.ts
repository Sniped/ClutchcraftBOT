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
		if (!tag || !tag.result) return;
		const embed = new MessageEmbed()
			.setDescription(tag.result.content)
			.setColor('GREEN');
		await tag.result.updateOne({ uses: tag.result.uses + 1 }).exec();
		message.channel.send({ embeds: [embed] });
	}
}
