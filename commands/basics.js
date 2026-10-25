const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

const BASIC_RULES = {
	'short-rest': {
		title: 'Short Rest',
		description: [
			'• A Short Rest takes at least 1 hour.',
			'• You can spend one or more Hit Dice to recover Hit Points. Roll each die and add your Constitution modifier to each roll.',
			'• You can use features that recharge on a Short Rest.',
			'• A Short Rest does not restore spent Hit Dice; you recover Hit Dice at the end of a Long Rest.',
		].join('\n'),
	},
	'long-rest': {
		title: 'Long Rest',
		description: [
			'• A Long Rest takes at least 8 hours.',
			'• You regain all lost Hit Points.',
			'• You regain spent Hit Dice equal to half your total number of Hit Dice (minimum 1).',
			'• You can benefit from only one Long Rest in a 24-hour period.',
			'• A Long Rest can recharge features that recharge on a Long Rest.',
		].join('\n'),
	},
	inspiration: {
		title: 'Heroic Inspiration',
		description: [
			'• Spend Heroic Inspiration to reroll any die immediately after rolling it.',
			'• You must use the new roll.',
			'• You can have only one Heroic Inspiration at a time.',
			'• If you gain Heroic Inspiration while you already have one, you can give it to an eligible ally who can see or hear you.',
		].join('\n'),
	},
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('basics')
		.setDescription('Look up core D&D 5.5e rules.')
		.addStringOption((option) =>
			option
				.setName('topic')
				.setDescription('The rule you want to look up')
				.setRequired(true)
				.addChoices(
					{ name: 'Short Rest', value: 'short-rest' },
					{ name: 'Long Rest', value: 'long-rest' },
					{ name: 'Heroic Inspiration', value: 'inspiration' },
				),
		),

	async execute(interaction) {
		const topic = interaction.options.getString('topic', true);
		const rule = BASIC_RULES[topic];

		if (!rule) {
			await interaction.reply({
				content: 'That basics topic is not available. Please choose one of the listed topics.',
				ephemeral: true,
			});
			return;
		}

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(0x2e8b57)
					.setTitle(`📖 ${rule.title}`)
					.setDescription(rule.description)
					.setFooter({ text: 'D&D 5.5e quick reference' }),
			],
		});
	},
};
