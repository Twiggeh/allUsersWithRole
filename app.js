/* eslint-disable indent */
(async () => {
	const NodeArguments = process.argv.slice(2);

	const toggler = 't';
	const searcher = 's';
	const runner = 'd';
	const wrangler = 'w';
	const toggleAmountCmd = `${toggler}Amount`;
	const toggleUserCmd = `${toggler}User`;
	const toggleTitleCmd = `${toggler}Title`;
	const searchForRoleArrayCmd = `${searcher}Role`;
	const searchForRolesCmd = `${runner}Role`;
	const wrangleLiquidCmd = `${wrangler}Liquid`;
	const wrangleAllWithoutRolesCmd = `${wrangler}WithoutRoles`;
	const prettyPrintCmd = `${toggler}PrettyPrint`;
	const printRolesCmd = `${toggler}PrintRoles`;
	const printJoinDateCmd = `${toggler}PrintJoinDate`;
	const printUserIdCmd = `${toggler}PrintUserId`;

	const config = {
		[searchForRolesCmd]: true,
		[toggleUserCmd]: true,
		[toggleAmountCmd]: true,
		[toggleTitleCmd]: true,
		[searchForRoleArrayCmd]: [
			'No Role',
			'584431967093784577',
			'DCHECK',
			'598473102778826770',
		],
		[wrangleLiquidCmd]: false,
		[wrangleAllWithoutRolesCmd]: false,
		[prettyPrintCmd]: true,
		[printRolesCmd]: false,
		[printJoinDateCmd]: false,
		[printUserIdCmd]: false,
		listCommands: undefined,
		help: undefined,
		h: undefined,
	};

	const validConfig = Object.keys(config);

	if (
		NodeArguments.includes('listCommands') ||
		NodeArguments.includes('help') ||
		NodeArguments.includes('h')
	) {
		validConfig.forEach(configName => {
			// prettier-ignore
			console.log(`Command : \`${configName}\` defaults : \`${Object.is(config[configName]) ? JSON.stringify(config[configName]): config[configName]}\``);
		});
		process.exit(0);
	}

	const liquidWrangler = async () => {
		// clanMemberChildProcess
		// prettier-ignore
		const cMemChildProc = spawnSync('node', ['app', 'tTitle', 'tPrettyPrint', 'tAmount', 'tPrintRoles', 'tPrintJoinDate', 'sRole', JSON.stringify(['Clan Member', '589030949488951296'])]);
		const clanMembers = cMemChildProc.stdout.toString().split('\n');

		const hasRoles = (roles, userRoles) => {
			let i = 0;
			let result = -1;
			while (i < userRoles.length && result === -1) {
				result = roles.indexOf(userRoles[i]);
				i++;
			}
			return result === -1 ? undefined : roles[result + 1];
		};

		const resultPlayers = [];
		const rowUl = start =>
			`{{Squad player list ${start ? 'start|main=true|best results range=' : 'end'}}}\n`;
		const rowLi = 'Squad player row';
		const padding = {
			flag: 2,
			race: 1,
			userName:
				clanMembers.reduce((acc, cur, i) => {
					if (i % 3 === 0) {
						return Math.max(acc, cur.length);
					} else return acc;
				}, clanMembers[0].length) - 5,
			name: 0,
			joindate: 10,
		};

		// TODO DISCORD BUG : CLANMEMBERS HAS AN EMPTY STRING AS THE LAST ELEMENT, shouldn't be there
		for (let i = 0; i < clanMembers.length - 1; i++) {
			if (i % 3 !== 0) continue;
			const userName = clanMembers[i];
			const roleArr = clanMembers[i + 1].split(',');
			const joinDate = clanMembers[i + 2];

			const countryID = hasRoles(countries, roleArr);
			const raceID = hasRoles(races, roleArr);

			const playerFactory = ({ flag, race, userName, /* name, */ joinDate }) => {
				// prettier-ignore
				const constructRow = args =>`  {{ ${rowLi} | ${Object.keys(args).reduce(formatter, '')} }}`;

				const _userName = `${userName.slice(0, -5)}`;
				const args = {
					flag,
					race,
					userName: _userName,
					/* name, */ joindate: joinDate,
				};
				const noIdentifiers = currentArg => ['userName'].includes(currentArg);

				const formatter = (acc, cur, i) =>
					(acc += `${
						noIdentifiers(cur)
							? `${
									args[cur]
										? args[cur].padEnd(padding[cur], ' ')
										: ' '.repeat(padding[cur])
							  }`
							: `${cur}=${
									args[cur]
										? args[cur].padEnd(padding[cur], ' ')
										: ' '.repeat(padding[cur])
							  }`
					}${i !== Object.keys(args).length - 1 ? ' | ' : ''}`); // last element should not have the |

				return constructRow(args);
			};

			resultPlayers[i] = playerFactory({
				flag: countryID,
				race: raceID,
				userName,
				joinDate,
			});
		}

		return console.log(
			`${rowUl(true)}${resultPlayers.filter(() => true).join('\n')}\n${rowUl(false)}`
		);
	};

	const allWithoutWrangler = () => {
		const oneMatch = (userRoles, roles) => {
			let result = false;
			for (let i = 0; i < userRoles.length; i++) {
				const rolesInclude = roles.includes(userRoles[i]);
				if (rolesInclude) return true;
			}
			return result;
		};

		const hasWhichRoles = ({ include, exclude }, userRoles) => {
			const result = {};
			for (let roleGroup in exclude) {
				const roles = exclude[roleGroup];
				if (oneMatch(userRoles, roles)) return { excluded: true };
			}
			Object.keys(include).forEach(roleGroup => {
				const roles = include[roleGroup];
				result[roleGroup] = oneMatch(userRoles, roles);
			});
			return result;
		};

		const everyoneWithRoles = spawnSync('node', [
			'app',
			'tTitle',
			'tPrettyPrint',
			'tAmount',
			'tPrintRoles',
			'sRole',
			JSON.stringify(['everyone', '589030949488951296']),
		])
			.stdout.toString()
			.split('\n');

		const matcher = {
			include: { ranks, country: countries, member: ['547405702293880844'], races },
			exclude: {
				guest: ['547406011842035715'],
			},
		};

		const result = {};

		// TODO : DISCORD BUG requires the - 1, otherwise empty strings will be "processed"
		for (let i = 1; i < everyoneWithRoles.length - 1; i += 2) {
			const roles = everyoneWithRoles[i].split(',');
			const user = everyoneWithRoles[i - 1];
			const hasRoles = hasWhichRoles(matcher, roles);
			let key = '';
			Object.keys(hasRoles).forEach(role => {
				const hasRole = hasRoles[role];
				if (!hasRole) {
					key += `no${role}_and_`;
				}
			});
			if (key !== '') {
				if (result[key] === undefined) {
					result[key] = [user];
				} else {
					result[key].push(user);
				}
			}
		}

		const prettyResults = [];
		for (let missingRoleKeys in result) {
			const roleKeyArr = missingRoleKeys.split('_and_');
			roleKeyArr.pop();
			const args = roleKeyArr.length;
			const lastEl = roleKeyArr.splice(-1, 1)[0].slice(2);
			const commaJoined = roleKeyArr.map(el => el.slice(2)).join(', ');
			const prettyKey =
				commaJoined !== ''
					? `${commaJoined.toUpperCase()} and ${lastEl.toUpperCase()}`
					: lastEl.toUpperCase();
			const tuple = [prettyKey, result[missingRoleKeys]];
			if (prettyResults[args] === undefined) prettyResults[args] = [];
			prettyResults[args].push(tuple);
		}
		prettyResults.forEach(prettyResult => {
			prettyResult.forEach(([prettyKey, users]) => {
				const prettyStr = `\n\nThese users don't have a role in the Role-Group: \`${prettyKey}\`\n`;
				// The -3 are the "special characters like newline \n", they are counted in length but are not visible
				process.stdout.write(prettyStr + `${'='.repeat(prettyStr.length - 3)}\n\n`);
				users.forEach(user => process.stdout.write(`${user}\n`));
			});
		});
	};

	// MAIN PROGRAM STARTS
	for (let i = 0; i < NodeArguments.length; i++) {
		const argument = NodeArguments[i];
		// exit on bad params
		if (!validConfig.includes(argument)) {
			// reduces array to one readable string
			const validConfigReadable = validConfig.reduce(
				(acc, cur) => `${acc}\n\`${cur}\``,
				''
			);
			console.error(
				`\nINVALID ARGUMENT "${argument}" PASSED TO BOT.\n\nACCEPTABLE ARGUMENTS: ${validConfigReadable}\n\nSearchers not fully implemented. Ignore if Searchers throwing this error\n`
			);
			//process.exit(1);
		}
		// runner
		if (argument.substr(0, runner.length) === runner) {
			config[argument] = NodeArguments[i + 1] == true;
			i++;
		}
		// toggler
		if (argument.substr(0, toggler.length) === toggler) {
			config[argument] = !config[argument];
		}
		// searcher
		if (argument.substr(0, searcher.length) === searcher) {
			if (argument === searchForRoleArrayCmd) {
				config[searchForRoleArrayCmd] = JSON.parse(NodeArguments[i + 1]);
				i++;
			}
		}
		// wrangler
		if (argument.substr(0, wrangler.length) === wrangler) {
			switch (argument) {
				case wrangleLiquidCmd:
					return liquidWrangler();
				case wrangleAllWithoutRolesCmd: {
					console.log('Running Wrangler');
					return allWithoutWrangler();
				}
			}
		}
	}

	const renderOutput = (
		{
			toggleTitle,
			toggleAmount,
			toggleUser,
			printRoles,
			printJoinDate,
			searchForRoleArray,
			printUserId,
			i,
		},
		matchedUsers,
		prettyPrint,
		allRoles
	) => {
		const prettyPrinter = () => {
			if (toggleTitle) process.stdout.write(`\n**${searchForRoleArray[i]}**\n`);
			// prettier-ignore
			if (toggleAmount) process.stdout.write(`${`Users with the \`${searchForRoleArray[i]}\` role: ${matchedUsers.size}`}\n`);
			// print matched users
			matchedUsers.forEach(user => {
				if (toggleUser) console.log(user.user.tag);

				if (printRoles)
					console.log(
						user._roles.map(id => {
							const index = allRoles.indexOf(id);
							if (index === -1)
								console.error(
									new Error(
										`Found non existing role with id: ${id}. Please update all roles.`
									)
								);
							return allRoles[index - 1];
						})
					);

				if (printJoinDate)
					process.stdout.write(
						user.joinedAt
							.toLocaleDateString('de-DE', { dateStyle: 'medium' })
							.split('.')
							.reverse()
							.join('-') + '\n'
					);

				if (printUserId) console.log(user.id);
			});
		};

		const uglyPrinter = () => {
			// Ugly Print / Child Process
			if (toggleAmount)
				process.stdout.write(`${searchForRoleArray[i]}:${matchedUsers.size}\n`);

			matchedUsers.forEach(user => {
				if (toggleUser) process.stdout.write(user.user.tag + '\n');
				if (printRoles) process.stdout.write(user._roles + '\n');
				if (printJoinDate)
					process.stdout.write(
						user.joinedAt
							.toLocaleDateString('de-DE', { dateStyle: 'medium' })
							.split('.')
							.reverse()
							.join('-') + '\n'
					);
				if (printUserId) process.stdout.write(`${user.id}\n`);
			});
		};
		return prettyPrint ? prettyPrinter() : uglyPrinter();
	};

	const bot = new Discord.Client();

	bot.login(key);
	bot.on('ready', () => {
		const {
			[searchForRolesCmd]: searchForRoles,
			[searchForRoleArrayCmd]: searchForRoleArray,
			[toggleAmountCmd]: toggleAmount,
			[toggleUserCmd]: toggleUser,
			[prettyPrintCmd]: prettyPrint,
			[printRolesCmd]: printRoles,
			[printJoinDateCmd]: printJoinDate,
			[toggleTitleCmd]: toggleTitle,
			[printUserIdCmd]: printUserId,
		} = config;
		// Bot logged in successfully
		bot.user.setActivity(' with your data :3');
		if (prettyPrint) console.log('Bot is ready! ' + bot.user.username);

		// RoleSearcher
		if (searchForRoles) {
			const guild = bot.guilds.cache.get('546452030273748993');
			const users = guild.members.cache;
			if (searchForRoleArray[0] === 'everyone') {
				renderOutput(
					{
						toggleTitle,
						toggleAmount,
						toggleUser,
						printRoles,
						printJoinDate,
						searchForRoleArray,
						printUserId,
					},
					users,
					prettyPrint,
					allRoles
				);
				process.exit(0);
			}
			const roleArr = [];
			guild.roles.cache.forEach(role => roleArr.push(role.name, role.id));
			for (let i = 0; i < searchForRoleArray.length; i += 2) {
				const matchedUsers = users.filter(value => {
					return value._roles.includes(searchForRoleArray[i + 1]);
				});
				renderOutput(
					{
						toggleTitle,
						toggleAmount,
						toggleUser,
						printRoles,
						printJoinDate,
						searchForRoleArray,
						printUserId,
						i,
					},
					matchedUsers,
					prettyPrint,
					allRoles
				);
			}
		}
		process.exit(0);
	});
})();

import { spawnSync } from 'child_process';
import Discord from 'discord.js';
import key from './keys.js';
import { allRoles, ranks, countries, races } from './roles.js';
