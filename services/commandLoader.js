const fs = require('node:fs');
const path = require('node:path');

const COMMANDS_DIRECTORY = path.join(__dirname, '..', 'commands');

function loadCommands() {
	const commandFiles = fs.readdirSync(COMMANDS_DIRECTORY)
		.filter((fileName) => fileName.endsWith('.js'));

	return commandFiles.map((fileName) => {
		const command = require(path.join(COMMANDS_DIRECTORY, fileName));

		if (!command.data?.name || typeof command.execute !== 'function') {
			throw new Error(`Invalid command module: ${fileName}`);
		}

		return command;
	});
}

module.exports = {
	COMMANDS_DIRECTORY,
	loadCommands,
};
