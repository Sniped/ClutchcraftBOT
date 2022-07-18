import { ChatInputCommand, Command } from '@sapphire/framework';

export class PingCommand extends Command {
	constructor(context: Command.Context, options: Command.Options) {
		super(context, { ...options, name: 'ping', description: 'Ping pong!' });
	}

	async chatInputRun(interaction: Command.ChatInputInteraction) {
		return await interaction.reply(`🏓 Pong!`);
	}

	override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(builder =>
			builder.setName(this.name).setDescription(this.description)
		);
	}
}
