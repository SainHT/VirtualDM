const { randomInt } = require('node:crypto');
const { SlashCommandBuilder } = require('discord.js');

const diceExpression = /^(\d+)d(\d+)([+-]\d+)?$/i;
const MAX_DICE = 100;
const MAX_SIDES = 100;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll dice using standard D&D notation.')
		.addStringOption((option) =>
			option
				.setName('expression')
				.setDescription('The dice expression, e.g., 4d6+6')
				.setRequired(true),
		),

	async execute(interaction) {
		const originalExpression = interaction.options.getString('expression', true);
		const normalizedExpression = originalExpression.replace(/\s/g, '');
		const match = diceExpression.exec(normalizedExpression);

		if (!match) {
			await interaction.reply({
				content: 'Invalid expression. Use notation such as `4d6+6`, `1d20-2`, or `1d20`.',
				ephemeral: true,
			});
			return;
		}

		const diceCount = Number(match[1]);
		const sides = Number(match[2]);
		const modifier = match[3] ? Number(match[3]) : 0;

		if (
			!Number.isSafeInteger(diceCount) ||
			!Number.isSafeInteger(sides) ||
			!Number.isSafeInteger(modifier) ||
			diceCount < 1 ||
			diceCount > MAX_DICE ||
			sides < 1 ||
			sides > MAX_SIDES
		) {
			await interaction.reply({
				content: `Expression is out of bounds. Use 1-${MAX_DICE} dice and 1-${MAX_SIDES} sides per die.`,
				ephemeral: true,
			});
			return;
		}

		const rolls = Array.from({ length: diceCount }, () => randomInt(1, sides + 1));
		const total = rolls.reduce((sum, roll) => sum + roll, modifier);
		const modifierText = modifier === 0 ? 'None' : modifier > 0 ? `+${modifier}` : `${modifier}`;

		await interaction.reply(
			[
				`**Expression:** \`${originalExpression}\``,
				`**Rolls:** [${rolls.join(', ')}]`,
				`**Modifier:** ${modifierText}`,
				`**Total:** ${total}`,
			].join('\n'),
		);
	},
};
