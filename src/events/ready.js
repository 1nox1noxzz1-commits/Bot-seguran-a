const { startScheduler } = require('../utils/scheduler');
const { getGuild }       = require('../utils/database');

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    console.log(`✅ ${client.user.tag} está online!`);
    client.user.setActivity('🛡️ Anti-Raid Ativo');

    // Reiniciar schedulers de mensagens automáticas para todos os servidores
    for (const [guildId] of client.guilds.cache) {
      const config = getGuild(guildId);
      if (config.autoMessages?.enabled) {
        startScheduler(client, guildId, config.autoMessages);
      }
    }
  },
};
