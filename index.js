require('dotenv').config();

const {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
} = require('discord.js');

const { loadCommands } = require('./services/commandLoader');
const { loadData } = require('./services/dataLoader');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

for (const command of loadCommands()) {
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, async (readyClient) => {
	console.log(`Logged in as ${readyClient.user.tag}`);

	try {
		await loadData();
		const commandData = [...client.commands.values()]
			.map((command) => command.data.toJSON());
		const guilds = [...readyClient.guilds.cache.values()];

		await Promise.all(
			guilds.map((guild) => guild.commands.set(commandData)),
		);
		console.log(`Registered ${client.commands.size} slash commands in ${guilds.length} guild(s)`);
	}
	catch (error) {
		console.error('Failed to load data or register commands:', error);
	}
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	const command = client.commands.get(interaction.commandName);
	if (!command) {
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(`Error executing /${interaction.commandName}:`, error);

		const errorReply = {
			content: 'There was an error while executing that command.',
			ephemeral: true,
		};

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp(errorReply);
		}
		else {
			await interaction.reply(errorReply);
		}
	}
});

const discordToken = process.env.discord_token;

if (!discordToken) {
	console.error('Missing discord_token environment variable. Set it before starting the bot.');
	process.exitCode = 1;
}
else {
	client.login(discordToken).catch((error) => {
		console.error('Discord login failed. Check that discord_token is valid:', error.message);
		process.exitCode = 1;
	});
}
