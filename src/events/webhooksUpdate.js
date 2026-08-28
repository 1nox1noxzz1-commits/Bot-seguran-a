const { EmbedBuilder } = require('discord.js');
const { getGuild }     = require('../utils/database');
const { sendProtectionLog, sendOwnerDM } = require('../utils/protection');

module.exports = {
  name: 'webhooksUpdate',

  async execute(channel, client) {
    const config = getGuild(channel.guild.id);
    const prot   = config.protection.webhook;
    if (!prot.enabled) return;

    const webhooks = await channel.fetchWebhooks().catch(() => null);
    if (!webhooks) return;

    const recent = webhooks.filter(w => Date.now() - w.createdTimestamp < 15_000);
    if (!recent.size) return;

    for (const [, webhook] of recent) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🪝 Webhook Criado')
        .setDescription(`Webhook **${webhook.name}** criado em **#${channel.name}**.`)
        .setTimestamp();

      await sendProtectionLog(client, prot.logChannel, embed);
      await sendOwnerDM(
        client,
        'Criação de Webhook',
        `Webhook **${webhook.name}** criado em #${channel.name}.\nPermites esta ação?`,
        null,
        async () => webhook.delete('Anti-Raid: não aprovado').catch(() => {}),
      );
    }
  },
};
