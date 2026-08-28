const { EmbedBuilder } = require('discord.js');
const { getGuild }     = require('../utils/database');
const { sendProtectionLog, sendOwnerDM } = require('../utils/protection');

module.exports = {
  name: 'channelCreate',

  async execute(channel, client) {
    const config = getGuild(channel.guild.id);
    const prot   = config.protection.channelCreate;
    if (!prot.enabled) return;

    const embed = new EmbedBuilder()
      .setColor(0xFFA500)
      .setTitle('📁 Canal Criado')
      .setDescription(`Canal **#${channel.name}** foi criado.`)
      .setTimestamp();

    await sendProtectionLog(client, prot.logChannel, embed);
    await sendOwnerDM(
      client,
      'Criação de Canal',
      `O canal **#${channel.name}** foi criado no servidor **${channel.guild.name}**.\nPermites esta ação?`,
      null,
      async () => channel.delete('Anti-Raid: não aprovado pelo dono').catch(() => {}),
    );
  },
};
