const { EmbedBuilder } = require('discord.js');
const { getGuild }     = require('../utils/database');
const { getCounter, countRecent, sendProtectionLog, sendOwnerDM } = require('../utils/protection');

module.exports = {
  name: 'guildBanAdd',

  async execute(ban, client) {
    const config = getGuild(ban.guild.id);
    const prot   = config.protection.massBan;
    if (!prot.enabled) return;

    const counter = getCounter(ban.guild.id);
    counter.bans.push(Date.now());

    const threshold = prot.threshold || 3;
    const interval  = prot.interval  || 10;
    const recent    = countRecent(counter.bans, interval);

    if (recent >= threshold) {
      counter.bans = [];

      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🚨 Ban em Massa Detetado!')
        .setDescription(`**${recent}** bans nos últimos **${interval}** segundos.`)
        .setTimestamp();

      await sendProtectionLog(client, prot.logChannel, embed);
      await sendOwnerDM(
        client,
        'Ban em Massa',
        `⚠️ Foram detetados **${recent} bans** nos últimos **${interval}s** no servidor **${ban.guild.name}**!\nO servidor pode estar sob ataque.`,
        null,
        null,
      );
    }
  },
};
