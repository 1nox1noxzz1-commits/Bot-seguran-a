require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];

function loadCommands(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) loadCommands(full);
    else if (entry.name.endsWith('.js')) {
      const cmd = require(full);
      if (cmd.data) commands.push(cmd.data.toJSON());
    }
  }
}

loadCommands(path.join(__dirname, 'commands'));

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log(`A registar ${commands.length} slash command(s)...`);

    // Guild commands (instantâneos para dev)
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log('✅ Guild commands registados com sucesso!');
    } else {
      // Global commands (até 1h para propagar)
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
      console.log('✅ Global commands registados com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao registar commands:', error);
  }
})();
