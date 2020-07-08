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
    const cMemChildProc = spawnSync(
      // clanMemberChildProcess
      'node',
      [
        'app',
        'tTitle',
        'tPrettyPrint',
        'tAmount',
        'tPrintRoles',
        'tPrintJoinDate',
        'sRole',
        JSON.stringify(['Clan Member', '589030949488951296']),
      ]
    );
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
        if (rolesInclude) return (result = true);
      }
      return result;
    };

    const hasWhichRoles = (matcher, userRoles) => {
      const result = {};
      Object.keys(matcher).forEach(roleGroup => {
        const roles = matcher[roleGroup];
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

    // TODO : DISCORD BUG requires the - 2, otherwise empty strings will be "processed"
    const result = [];
    for (let i = 1; i < everyoneWithRoles.length - 2; i += 2) {
      const roles = everyoneWithRoles[i].split(',');
      const user = everyoneWithRoles[i - 1];
      const matcher = {
        ranks,
        country: countries,
        member: ['547405702293880844'],
        races,
        guest: ['547406011842035715'],
      };
      const hasRoles = hasWhichRoles(matcher, roles);
      result.push(user, hasRoles);
    }
    const renderResult = result => {
      const keys = Object.keys(result[1]);
      const resultObject = {};
      keys.forEach(key => {
        resultObject[key] = [];
        resultObject['no' + key] = [];
      });
      for (let i = 1; i < result.length; i += 2) {
        const user = result[i - 1];
        const roleObject = result[i];
        Object.keys(roleObject).forEach(key => {
          // Here the guests are excluded.
          const has = roleObject[key];
          if (has) return resultObject[key].push(user);
          resultObject['no' + key].push(user);
        });
      }
      const purgeDup = (toPurge, duper) =>
        toPurge.filter(cur => (duper.indexOf(cur) === -1 ? true : false));

      keys.forEach(key => {
        if (key !== 'guest') {
          process.stdout.write(
            `\n\nThese users don't have a role in the Role-Group ${key}\n===================================================\n\n`
          );
          purgeDup(resultObject['no' + key], resultObject.guest).forEach(user =>
            process.stdout.write(`${user}\n`)
          );
        }
      });

      for (let i = 0; i < keys.length; i++) {
        const firstSelector = resultObject['no' + keys[i]];
        // todo make aggregator for all matchers.
      }
    };
    renderResult(result);
  };

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
          return await liquidWrangler();
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
        if (toggleUser) {
          console.log(user.user.tag);
        }
        if (printRoles) {
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
        }
        if (printJoinDate)
          process.stdout.write(
            user.joinedAt
              .toLocaleDateString('de-DE', { dateStyle: 'medium' })
              .split('.')
              .reverse()
              .join('-') + '\n'
          );
      });
    };

    const uglyPrinter = () => {
      // Ugly Print / Child Process
      if (toggleAmount) {
        process.stdout.write(`${searchForRoleArray[i]}:${matchedUsers.size}\n`);
      }
      if (toggleUser) {
        matchedUsers.forEach(user => {
          process.stdout.write(user.user.tag + '\n');
          if (printRoles) process.stdout.write(user._roles + '\n');
          if (printJoinDate)
            process.stdout.write(
              user.joinedAt
                .toLocaleDateString('de-DE', { dateStyle: 'medium' })
                .split('.')
                .reverse()
                .join('-') + '\n'
            );
        });
      }
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
import fs from 'fs';
import { allRoles, ranks, countries, races } from './roles.js';
