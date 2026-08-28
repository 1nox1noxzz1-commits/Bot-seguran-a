const { EmbedBuilder } = require('discord.js');
const { getGuild }     = require('../utils/database');
const { getCounter, countRecent, sendProtectionLog, sendOwnerDM } = require('../utils/protection');

module.exports = {
  name: 'guildMemberRemove',

  async execute(member, client) {
    if (member.user.bot) return;

    const config = getGuild(member.guild.id);
    const prot   = config.protection.massKick;
    if (!prot.enabled) return;

    // Ignorar se foi ban
    const isBanned = await member.guild.bans.fetch(member.id).catch(() => null);
    if (isBanned) return;

    const counter   = getCounter(member.guild.id);
    const threshold = prot.threshold || 3;
    const interval  = prot.interval  || 10;

    counter.kicks.push(Date.now());
    const recent = countRecent(counter.kicks, interval);

    if (recent >= threshold) {
      counter.kicks = [];

      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🚨 Kick em Massa Detetado!')
        .setDescription(`**${recent}** kicks nos últimos **${interval}** segundos.`)
        .setTimestamp();

      await sendProtectionLog(client, prot.logChannel, embed);
      await sendOwnerDM(
        client,
        'Kick em Massa',
        `⚠️ Foram detetados **${recent} kicks** nos últimos **${interval}s** no servidor **${member.guild.name}**!`,
        null,
        null,
      );
    }
  },
};
