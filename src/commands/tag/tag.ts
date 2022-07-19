import { Command, RegisterBehavior } from '@sapphire/framework';
import {
	MessageActionRow,
	MessageEmbed,
	Modal,
	ModalActionRowComponent,
	TextInputComponent,
} from 'discord.js';
import { TagModel } from '../../model/tag';
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
				// Proceed to subcommand groups
				break;
		}

		switch (subcommandGroup) {
			case 'alias':
				this.TagAliasCommand(interaction);
				return;
			default:
				break;
		}

		return;
	}

	private async TagSetCommand(interaction: Command.ChatInputInteraction) {
		const tagName = interaction.options.getString('name');
		const tag = await TagModel.findOne({ name: tagName }).exec();
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
		const tagName = interaction.options.getString('name', true);
		const tag = await TagModel.findByName(tagName);
		if (!tag)
			return await interaction.reply(`❌ no tag found (\`${tagName}\`)`);
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
		await interaction.reply('TODO');
	}

	private async TagRenameCommand(interaction: Command.ChatInputInteraction) {
		await interaction.reply('TODO');
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

	private async TagAliasAddCommand(interaction: Command.ChatInputInteraction) {
		await interaction.reply('TODO');
	}

	private async TagAliasListCommand(interaction: Command.ChatInputInteraction) {
		await interaction.reply('TODO');
	}

	private async TagAliasRemoveCommand(
		interaction: Command.ChatInputInteraction
	) {
		await interaction.reply('TODO');
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
