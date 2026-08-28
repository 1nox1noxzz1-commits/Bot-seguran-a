const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');

// Map de guildId → tarefa cron activa
const tasks = new Map();

function startScheduler(client, guildId, config) {
  stopScheduler(guildId);

  if (!config.enabled || !config.channel || !config.message || !config.cronExpression) return;

  const task = cron.schedule(config.cronExpression, async () => {
    try {
      const channel = await client.channels.fetch(config.channel).catch(() => null);
      if (!channel) return;

      if (config.type === 'embed') {
        const embed = new EmbedBuilder()
          .setDescription(config.message)
          .setColor(0x5865F2)
          .setTimestamp();
        await channel.send({ embeds: [embed] });
      } else {
        await channel.send({ content: config.message });
      }
    } catch (err) {
      console.error(`[Scheduler] Erro ao enviar mensagem para ${guildId}:`, err);
    }
  });

  tasks.set(guildId, task);
  console.log(`[Scheduler] Tarefa iniciada para guild ${guildId}`);
}

function stopScheduler(guildId) {
  const existing = tasks.get(guildId);
  if (existing) {
    existing.stop();
    tasks.delete(guildId);
    console.log(`[Scheduler] Tarefa parada para guild ${guildId}`);
  }
}

module.exports = { startScheduler, stopScheduler };
