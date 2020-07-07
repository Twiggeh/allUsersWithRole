(async () => {
  const NodeArguments = process.argv.slice(2);

  const toggler = 't';
  const searcher = 's';
  const runner = 'd';
  const wrangler = 'w';
  const toggleAmountCmd = `${toggler}Amount`;
  const toggleUserCmd = `${toggler}User`;
  const searchForRoleArrayCmd = `${searcher}Role`;
  const searchForRolesCmd = `${runner}Role`;
  const wrangleLiquidCmd = `${wrangler}Liquid`;
  const prettyPrintCmd = `${toggler}Print`;
  const printRolesCmd = `${toggler}PrintRoles`;
  const printJoinDateCmd = `${toggler}PrintJoinDate`;

  const config = {
    [searchForRolesCmd]: true,
    [toggleUserCmd]: true,
    [toggleAmountCmd]: true,
    [searchForRoleArrayCmd]: [
      'No Role',
      '584431967093784577',
      'DCHECK',
      '598473102778826770',
    ],
    [wrangleLiquidCmd]: false,
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
      const cMemChildProc = spawnSync(
        // clanMemberChildProcess
        'node',
        [
          'app',
          'tPrint',
          'tAmount',
          'tPrintRoles',
          'tPrintJoinDate',
          'sRole',
          JSON.stringify(['Clan Member', '589030949488951296']),
        ]
      );
      const clanMembers = cMemChildProc.stdout.toString().split('\n');

      const { countries, races } = await import('./roles.js');

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
        `{{Squad player list ${
          start ? 'start|main=true|best results range=' : 'end'
        }}}\n`;
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

      // TODO BUG : CLANMEMBERS HAS AN EMPTY STRING AS THE LAST ELEMENT, shouldn't be there
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
    }
  }

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
    } = config;
    // Bot logged in successfully
    bot.user.setActivity(' with your data :3');
    if (prettyPrint) console.log('Bot is ready! ' + bot.user.username);

    // RoleSearcher
    if (searchForRoles) {
      const guild = bot.guilds.cache.get('546452030273748993');
      const users = guild.members.cache;
      if (searchForRoleArray[0] === 'everyone') {
        users.forEach(user => {
          console.log(user.user.tag);
          // TODO : Pretty print the roles by substituting them with their named part
          if (printRoles) console.log(user._roles);
        });
        process.exit(0);
      }
      const roleArr = [];
      guild.roles.cache.forEach(role => roleArr.push(role.name, role.id));
      const myDate = new Date();
      for (let i = 0; i < searchForRoleArray.length; i += 2) {
        const matchedUsers = users.filter(value => {
          return value._roles.includes(searchForRoleArray[i + 1]);
        });
        if (prettyPrint) {
          // prettier-ignore
          console.log(`\n**${searchForRoleArray[i]}**\n${toggleAmount ? `Users with the \`${searchForRoleArray[i]}\` role: ${matchedUsers.size}`: ''}\n`);
          // print matched users
          if (toggleUser) {
            matchedUsers.forEach(user => {
              console.log(user.user.tag);
              // TODO : Pretty print the roles by substituting them with their named part
              if (printRoles) console.log(user._roles);
            });
          }
        } else {
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
        }
      }
    }
    process.exit(0);
  });
})();
import { spawnSync } from 'child_process';
import Discord from 'discord.js';
import key from './keys.js';
import fs from 'fs';
