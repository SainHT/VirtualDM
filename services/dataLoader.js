const fs = require('node:fs/promises');
const path = require('node:path');

const DATA_DIRECTORY = path.join(__dirname, '..', 'data');
const loadedData = new Map();

function cleanText(text) {
	return text
		.replace(/\{@[^}\s]+ ([^}|]+)(?:\|[^}]+)?\}/g, '$1')
		.replace(/\{@[^}\s]+ ([^}]+)\}/g, '$1')
		.replace(/\{@[^}]+\}/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * 5e-tools entries mix strings, arrays, and named objects. Recursing through
 * each text-bearing property turns those blocks into Discord-friendly markdown.
 */
function flattenEntries(value, depth = 0) {
	if (typeof value === 'string') {
		return cleanText(value);
	}

	if (Array.isArray(value)) {
		return value
			.map((entry) => flattenEntries(entry, depth))
			.filter(Boolean)
			.join('\n');
	}

	if (!value || typeof value !== 'object') {
		return '';
	}

	const heading = typeof value.name === 'string' ? `**${cleanText(value.name)}**` : '';
	const content = ['entries', 'items', 'text', 'entry']
		.flatMap((key) => value[key] === undefined ? [] : [flattenEntries(value[key], depth + 1)])
		.filter(Boolean)
		.join('\n');

	return [heading, content].filter(Boolean).join('\n');
}

function getConditionPriority(condition) {
	if (condition.basicRules2024 || condition.srd52 || condition.source === 'XPHB') {
		return 0;
	}

	return 1;
}

async function readJsonFile(fileName) {
	const filePath = path.join(DATA_DIRECTORY, fileName);

	try {
		const contents = await fs.readFile(filePath, 'utf8');
		return JSON.parse(contents);
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			console.error(`Unable to parse or read ${filePath}: ${error.message}`);
		}
		return null;
	}
}

async function loadData() {
	try {
		const directoryEntries = await fs.readdir(DATA_DIRECTORY);
		if (!directoryEntries.length) {
			console.error(`The data directory is empty: ${DATA_DIRECTORY}`);
			return;
		}
	}
	catch (error) {
		console.error(`Unable to access the data directory ${DATA_DIRECTORY}: ${error.message}`);
		return;
	}

	const conditionData = await readJsonFile('conditions.json')
		|| await readJsonFile('conditionsdiseases.json');
	const rulesData = await readJsonFile('rules.json');

	loadedData.clear();
	if (conditionData) {
		loadedData.set('conditions', conditionData);
	}
	else {
		console.error(
			'No condition data found. Expected data/conditions.json or data/conditionsdiseases.json.',
		);
	}
	if (rulesData) {
		loadedData.set('rules', rulesData);
	}

	console.log(`Loaded ${loadedData.size} 5e-tools data file(s) from ${DATA_DIRECTORY}`);
}

function getConditions() {
	return loadedData.get('conditions')?.condition || [];
}

function findCondition(name) {
	const normalizedName = name.trim().toLocaleLowerCase();
	return getConditions()
		.filter((condition) => condition.name?.toLocaleLowerCase() === normalizedName)
		.sort((left, right) => getConditionPriority(left) - getConditionPriority(right))[0] || null;
}

function listConditions() {
	return [...new Map(
		getConditions()
			.filter((condition) => condition.name)
			.map((condition) => [condition.name.toLocaleLowerCase(), condition.name]),
	).values()].sort((left, right) => left.localeCompare(right));
}

module.exports = {
	flattenEntries,
	findCondition,
	listConditions,
	loadData,
};
