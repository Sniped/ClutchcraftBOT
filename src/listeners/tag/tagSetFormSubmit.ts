import { Listener } from '@sapphire/framework';
import type { ModalSubmitInteraction } from 'discord.js';
import { Tag, TagModel } from '../../model/tag';
import { EMOJIS } from '../../util/constants';

export class TagSetFormSubmitListener extends Listener {
	constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			event: 'interactionCreate',
		});
	}

	async run(interaction: ModalSubmitInteraction) {
		if (
			interaction.type != 'MODAL_SUBMIT' ||
			!interaction.customId.startsWith('tagSetModal')
		)
			return;
		const tagName = interaction.customId.substring(
			interaction.customId.indexOf('@') + 1
		);
		const tag = await TagModel.findByName(tagName);
		const contentInputComponent = interaction.components[0].components[0];
		if (tag && tag.content === contentInputComponent.value)
			return await interaction.reply(
				`${EMOJIS.WARNING} no changes were made to tag (\`${tag.name}\`)`
			);
		else if (tag) {
			await tag
				.updateOne({
					content: contentInputComponent.value,
					lastEditorId: interaction.user.id,
				})
				.exec();
			return await interaction.reply(
				`${EMOJIS.WHITE_CHECK_MARK} updated tag (\`${tagName}\`)`
			);
		} else if (!tag) {
			const tag = {
				name: tagName,
				content: contentInputComponent.value,
				authorId: interaction.user.id,
				lastEditorId: interaction.user.id,
			} as Tag;
			TagModel.create(tag);
			return await interaction.reply(
				`${EMOJIS.WHITE_CHECK_MARK} created tag (\`${tagName}\`)`
			);
		}
	}
}
