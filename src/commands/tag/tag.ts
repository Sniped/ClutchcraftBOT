import { Command, RegisterBehavior } from '@sapphire/framework';
import {
	MessageActionRow,
	MessageEmbed,
	Modal,
	ModalActionRowComponent,
	TextInputComponent,
} from 'discord.js';
import { TagModel, TagQueryType } from '../../model/tag';
import { EMOJIS } from '../../util/constants';
import { prettyDate } from '../../util/functions';

// TODO: update this entire command once the subcommand plugin comes out
export class TagCommand extends Command {
	constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'tag',
			description: 'Homes all of the management commands related to tags',
		});
	}

	async chatInputRun(interaction: Command.ChatInputInteraction) {
		const subcommand = interaction.options.getSubcommand(true);
		const subcommandGroup = interaction.options.getSubcommandGroup(false);

		if (subcommandGroup) {
			switch (subcommandGroup) {
				case 'alias':
					this.TagAliasCommand(interaction);
					return;
				default:
					return;
			}
		}

		switch (subcommand) {
			case 'set':
				this.TagSetCommand(interaction);
				return;
			case 'info':
				this.TagInfoCommand(interaction);
				return;
			case 'rename':
				this.TagRenameCommand(interaction);
				return;
			case 'list':
				this.TagListCommand(interaction);
				return;
			default:
				return;
		}
	}

	private async TagAliasCommand(interaction: Command.ChatInputInteraction) {
		const subcommand = interaction.options.getSubcommand(true);

		switch (subcommand) {
			case 'add':
				this.TagAliasAddCommand(interaction);
				return;
			case 'remove':
				this.TagAliasRemoveCommand(interaction);
				return;
			case 'list':
				this.TagAliasListCommand(interaction);
				return;
			default:
				break;
		}

		return;
	}

	private async TagSetCommand(interaction: Command.ChatInputInteraction) {
		const tagName = interaction.options.getString('name', true).toLowerCase();
		const tag = await TagModel.findByName(tagName);
		const conflictingTag = await TagModel.findByAlias(tagName);
		if (conflictingTag)
			return await interaction.reply(
				`${EMOJIS.X_MARK} cannot set tag (\`${tagName}\`) as another tag is using this name as an alias (\`${conflictingTag.name}\`)`
			);
		const modal = new Modal()
			.setTitle(`Tag Set (${tagName})`)
			.setCustomId(`tagSetModal@${tagName}`);
		const contentInputComponent = new TextInputComponent()
			.setCustomId('content')
			.setLabel('Content')
			.setRequired(true)
			.setStyle('PARAGRAPH');
		if (tag) contentInputComponent.setValue(tag.content);
		modal.addComponents(
			new MessageActionRow<ModalActionRowComponent>().addComponents(
				contentInputComponent
			)
		);
		interaction.showModal(modal);
	}

	private async TagInfoCommand(interaction: Command.ChatInputInteraction) {
		const tagName = interaction.options.getString('name', true).toLowerCase();
		const tag = await TagModel.findByName(tagName);
		if (!tag)
			return await interaction.reply(
				`${EMOJIS.X_MARK} no tag found (\`${tagName}\`)`
			);
		let authorUser = this.container.client.users.resolve(tag.authorId);
		if (!authorUser)
			authorUser = await this.container.client.users
				.fetch(tag.authorId)
				.catch(() => (authorUser = null));
		let lastEditorUser = this.container.client.users.resolve(tag.lastEditorId);
		if (!lastEditorUser)
			lastEditorUser = await this.container.client.users
				.fetch(tag.lastEditorId)
				.catch(() => (lastEditorUser = null));
		const embed = new MessageEmbed()
			.addField('Name', tag.name)
			.addField(
				'Author',
				`${authorUser ? `${authorUser.tag} (${authorUser.id})` : tag.authorId}`,
				true
			)
			.addField(
				'Last Edited By',
				`${
					lastEditorUser
						? `${lastEditorUser.tag} (${lastEditorUser.id})`
						: tag.lastEditorId
				}`,
				true
			)
			.addField('Uses', tag.uses.toString())
			.addField('Created At', prettyDate(tag.createdAt), true)
			.addField('Updated At', prettyDate(tag.updatedAt), true)
			.setColor('DARK_GREEN');
		return await interaction.reply({ embeds: [embed] });
	}

	private async TagListCommand(interaction: Command.ChatInputInteraction) {
		// TODO: add pagination to this if necessary in the future
		const sortedTags = (await TagModel.find().exec()).sort((a, b) =>
			a.name.localeCompare(b.name)
		);
		const embed = new MessageEmbed()
			.setTitle(`Showing ${sortedTags.length} tags`)
			.setDescription(sortedTags.map(tag => `\`${tag.name}\``).join(', '))
			.setColor('DARK_GREEN');
		await interaction.reply({ embeds: [embed] });
	}

	private async TagRenameCommand(interaction: Command.ChatInputInteraction) {
		const tagName = interaction.options.getString('name', true).toLowerCase();
		const tag = await TagModel.findByName(tagName);
		if (!tag)
			return await interaction.reply(
				`${EMOJIS.X_MARK} no tag found (\`${tagName}\`)`
			);
		const newTagName = interaction.options.getString('new_name', true);
		const conflictingTag = await TagModel.findByAlias(newTagName);
		if (conflictingTag)
			return await interaction.reply(
				`${EMOJIS.X_MARK} cannot rename tag (\`${tagName}\`) as a tag is already using the name as an alias (\`${conflictingTag.name}\`)`
			);
		await tag.updateOne({ name: newTagName }).exec();
		return await interaction.reply(
			`${EMOJIS.WHITE_CHECK_MARK} successfully renamed tag (\`${tagName} -> ${newTagName}\`)`
		);
	}

	private async TagAliasAddCommand(interaction: Command.ChatInputInteraction) {
		const tagName = interaction.options.getString('name', true).toLowerCase();
		const alias = interaction.options
			.getString('alias_name', true)
			.toLowerCase();
		const tag = await TagModel.findByName(tagName);
		if (!tag)
			return await interaction.reply(
				`${EMOJIS.X_MARK} no tag found (\`${tagName}\`)`
			);
		const conflictingTag = await TagModel.findByNameOrAlias(alias);
		if (conflictingTag) {
			const conflictingTagType = conflictingTag.type;
			const conflictingTagRes = conflictingTag.result!;
			if (conflictingTagType == TagQueryType.Name)
				return await interaction.reply(
					`${EMOJIS.X_MARK} cannot add alias as it is already being used as a tag name (\`${tagName}\`)`
				);
			if (conflictingTagType == TagQueryType.Alias)
				return await interaction.reply(
					`${EMOJIS.X_MARK} cannot add alias (\`${alias}\`) as a tag is already using the alias (\`${conflictingTagRes.name}\`)`
				);
		}
		await tag.updateOne({ aliases: [...tag.aliases, alias] }).exec();
		return await interaction.reply(
			`${EMOJIS.WHITE_CHECK_MARK} successfully added alias (\`${alias}\`) to tag (\`${tagName}\`)`
		);
	}

	private async TagAliasListCommand(interaction: Command.ChatInputInteraction) {
		const tagName = interaction.options.getString('name', true).toLowerCase();
		const tag = await TagModel.findByName(tagName);
		if (!tag)
			return await interaction.reply(
				`${EMOJIS.X_MARK} no tag found (\`${tagName}\`)`
			);
		if (tag.aliases.length == 0)
			return await interaction.reply(
				`${EMOJIS.NAME_BADGE} \`${tagName}\` has no aliases`
			);
		return await interaction.reply(
			`${
				EMOJIS.NAME_BADGE
			} \`${tagName}\` has the following aliases: ${tag.aliases
				.map(a => `\`${a}\``)
				.join(', ')}`
		);
	}

	private async TagAliasRemoveCommand(
		interaction: Command.ChatInputInteraction
	) {
		const tagName = interaction.options.getString('name', true).toLowerCase();
		const tag = await TagModel.findByName(tagName);
		const alias = interaction.options
			.getString('alias_name', true)
			.toLowerCase();
		if (!tag)
			return await interaction.reply(
				`${EMOJIS.X_MARK} no tag found (\`${tagName}\`)`
			);
		if (!tag.aliases.includes(alias)) {
			const aliasedTag = await TagModel.findByAlias(alias);
			if (aliasedTag)
				return await interaction.reply(
					`${EMOJIS.X_MARK} tag (\`${tagName}\`) does not include alias (\`${alias}\`), but another tag (\`${aliasedTag.name}\`) uses it`
				);
			return await interaction.reply(
				`${EMOJIS.X_MARK} tag (\`${tagName}\`) does not include alias (\`${alias}\`)`
			);
		}
		await tag
			.updateOne({ aliases: tag.aliases.filter(a => a !== alias) })
			.exec();
		return await interaction.reply(
			`${EMOJIS.WHITE_CHECK_MARK} removed alias (\`${alias}\`) from tag (\`${tagName}\`)`
		);
	}

	override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			builder =>
				// tag
				builder
					.setName(this.name)
					.setDescription(this.description)
					// tag set
					.addSubcommand(command =>
						command
							.setName('set')
							.setDescription('Sets the content for a tag')
							.addStringOption(opt =>
								opt
									.setName('name')
									.setDescription(
										'The name of the tag you wish to set content for'
									)
									.setRequired(true)
							)
					)
					// tag info
					.addSubcommand(command =>
						command
							.setName('info')
							.setDescription('Gets information for a tag')
							.addStringOption(opt =>
								opt
									.setName('name')
									.setDescription(
										'The name of the tag you wish to get information for'
									)
									.setRequired(true)
							)
					)
					// tag rename
					.addSubcommand(command =>
						command
							.setName('rename')
							.setDescription('Sets a new name for a tag')
							.addStringOption(opt =>
								opt
									.setName('name')
									.setDescription('The name of the tag you wish to rename')
									.setRequired(true)
							)
							.addStringOption(opt =>
								opt
									.setName('new_name')
									.setDescription('The new name of the tag you wish to rename')
									.setRequired(true)
							)
					)
					// tag list
					.addSubcommand(command =>
						command.setName('list').setDescription('Lists all of the tags')
					)
					// tag alias
					.addSubcommandGroup(builder =>
						builder
							.setName('alias')
							.setDescription(
								'Homes all of the management commands related to tag aliases'
							)
							// tag alias add
							.addSubcommand(command =>
								command
									.setName('add')
									.setDescription('Adds a new alias to a tag')
									.addStringOption(opt =>
										opt
											.setName('name')
											.setDescription(
												'The name of the tag you wish to add an alias to'
											)
											.setRequired(true)
									)
									.addStringOption(opt =>
										opt
											.setName('alias_name')
											.setDescription('The name of the alias you wish to add')
											.setRequired(true)
									)
							)
							// tag alias remove
							.addSubcommand(command =>
								command
									.setName('remove')
									.setDescription('Removes an alias from a tag')
									.addStringOption(opt =>
										opt
											.setName('name')
											.setDescription(
												'The name of the alias you wish to remove'
											)
											.setRequired(true)
									)
									.addStringOption(opt =>
										opt
											.setName('alias_name')
											.setDescription(
												'The name of the alias you wish to remove'
											)
											.setRequired(true)
									)
							)
							// tag alias list
							.addSubcommand(command =>
								command
									.setName('list')
									.setDescription('Lists all of the aliases of a tag')
									.addStringOption(opt =>
										opt
											.setName('name')
											.setDescription(
												'The name of the tag you wish to get the aliases for'
											)
											.setRequired(true)
									)
							)
					),
			{ behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
		);
	}
}
