const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const {
	findCondition,
	flattenEntries,
	listConditions,
} = require('../services/dataLoader');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('condition')
		.setDescription('Look up a D&D condition from the local rules dataset.')
		.addStringOption((option) =>
			option
				.setName('name')
				.setDescription('The condition to look up; leave blank to list all conditions')
				.setRequired(false),
		),

	async execute(interaction) {
		const requestedName = interaction.options.getString('name');

		if (requestedName?.trim()) {
			const condition = findCondition(requestedName);
			if (!condition) {
				await interaction.reply({
					content: `I couldn't find the condition "${requestedName}" in the local rules dataset.`,
					ephemeral: true,
				});
				return;
			}

			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(0x4169e1)
						.setTitle(condition.name)
						.setDescription(flattenEntries(condition.entries))
						.setFooter({ text: '5e-tools local rules dataset' }),
				],
			});
			return;
		}

		const conditions = listConditions();
		if (!conditions.length) {
			await interaction.reply({
				content: 'No conditions are available because the local rules dataset could not be loaded.',
				ephemeral: true,
			});
			return;
		}

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(0x4169e1)
					.setTitle('Available Conditions')
					.setDescription(conditions.map((condition) => `• ${condition}`).join('\n'))
					.setFooter({ text: 'Use /condition name:<condition> for details' }),
			],
		});
	},
};
