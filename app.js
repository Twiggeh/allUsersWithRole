const Discord = require('discord.js');
const bot = new Discord.Client();
const key = require('./keys.json').bot.key;

bot.login(key);
const listUsersWithRole = [
  'No Role',
  '584431967093784577',
  'DCHECK',
  '598473102778826770',
];

bot.on('ready', () => {
  bot.user.setActivity(' with your data :3');
  console.log('Bot is ready! ' + bot.user.username);
  const users = bot.guilds.cache.get('546452030273748993').members.cache;

  for (let i = 0; i < listUsersWithRole.length; i += 2) {
    console.log('**' + listUsersWithRole[i] + '**');
    const matchedUsers = users.filter((value) => {
      return value._roles.includes(listUsersWithRole[i + 1]);
    });
    matchedUsers.forEach((user) => console.log(user.user.tag));
  }
});
