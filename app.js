const Discord = require("discord.js");
const bot = new Discord.Client();
const key = require("./keys.json").bot.key;
const LogAmmountOfPeopleWithRole = true; //false
const LogPeopleWithRole = false;

bot.login(key);
const listUsersWithRole = [
  //'No Role',
  //'584431967093784577',
  //'DCHECK',
  //'598473102778826770',
  "Terran",
  "546486592928350218",
  "Zerg",
  "546486534896091141",
  "Protoss",
  "546486620447309829",
  "Random",
  "551520197257854981",
];

bot.on("ready", () => {
  bot.user.setActivity(" with your data :3");
  console.log("Bot is ready! " + bot.user.username);
  const users = bot.guilds.get("546452030273748993").members;

  for (let i = 0; i < listUsersWithRole.length; i += 2) {
    console.log("**" + listUsersWithRole[i] + "**");

    const matchedUsers = users.filter((value) => {
      return value._roles.includes(listUsersWithRole[i + 1]);
    });
    if (LogAmmountOfPeopleWithRole) {
      console.log(
        `Ammount of people in role ${listUsersWithRole[i]} : ${matchedUsers.size}`
      );
      if (LogPeopleWithRole) {
        matchedUsers.forEach((user) => console.log(user.user.tag));
      }
    }
  }
});
