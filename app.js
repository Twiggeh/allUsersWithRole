const NodeArguments = process.argv.slice(2);

const toggler = 't';
const searcher = 's';
const runner = 'd';
const toggleAmountCmd = `${toggler}Amount`;
const toggleUserCmd = `${toggler}User`;
const searchForRoleArrayCmd = `${searcher}Role`;
const searchForRolesCmd = `${runner}Role`;

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
  validConfig.forEach((configName) => {
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
}

const Discord = require('discord.js');
const bot = new Discord.Client();
const key = require('./keys.json').bot.key;

bot.login(key);

bot.on('ready', () => {
  const {
    [searchForRolesCmd]: searchForRoles,
    [searchForRoleArrayCmd]: searchForRoleArray,
    [toggleAmountCmd]: toggleAmount,
    [toggleUserCmd]: toggleUser,
  } = config;
  // Bot logged in successfully
  bot.user.setActivity(' with your data :3');
  console.log('Bot is ready! ' + bot.user.username);

  // RoleSearcher
  if (searchForRoles) {
    const users = bot.guilds.cache.get('546452030273748993').members.cache;
    for (let i = 0; i < searchForRoleArray.length; i += 2) {
      const matchedUsers = users.filter((value) => {
        return value._roles.includes(searchForRoleArray[i + 1]);
      });
      // prettier-ignore
      console.log(`\n**${searchForRoleArray[i]}**\n${toggleAmount ? `Users with the \`${searchForRoleArray[i]}\` role: ${matchedUsers.size}`: ''}\n`);
      // print matched users
      if (toggleUser) {
        matchedUsers.forEach((user) => console.log(user.user.tag));
      }
    }
  }
  process.exit(0);
});
