const { EmbedBuilder } = require('discord.js');
const { getGuild }     = require('../utils/database');
const { sendProtectionLog, sendOwnerDM } = require('../utils/protection');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member, client) {
    const config = getGuild(member.guild.id);

    // ── Proteção: bot adicionado ──────────────────────────────
    if (member.user.bot) {
      const prot = config.protection.addBot;
      if (prot.enabled) {
        const embed = new EmbedBuilder()
          .setColor(0xFFA500)
          .setTitle('🤖 Bot Adicionado')
          .setDescription(`Bot **${member.user.tag}** foi adicionado ao servidor.`)
          .setTimestamp();

        await sendProtectionLog(client, prot.logChannel, embed);
        await sendOwnerDM(
          client,
          'Bot Adicionado',
          `O bot **${member.user.tag}** foi adicionado ao servidor **${member.guild.name}**.\nPermites esta ação?`,
          null,
          async () => member.kick('Anti-Raid: bot não aprovado pelo dono').catch(() => {}),
        );
      }
      return;
    }

    // ── Entrada: marcar novo membro e apagar após 5s ──────────
    if (config.entrada?.enabled && config.entrada?.channel) {
      const channel = await client.channels.fetch(config.entrada.channel).catch(() => null);
      if (channel) {
        const msg = await channel.send({ content: `👋 Bem-vindo(a) ao servidor, ${member}!` }).catch(() => null);
        if (msg) setTimeout(() => msg.delete().catch(() => {}), 5000);
      }
    }
  },
};
