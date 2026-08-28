const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Contadores em memória para deteção em massa
const counters = new Map();

function getCounter(guildId) {
  if (!counters.has(guildId)) counters.set(guildId, { bans: [], kicks: [] });
  return counters.get(guildId);
}

function countRecent(list, windowSeconds) {
  const now = Date.now();
  return list.filter(t => now - t < windowSeconds * 1000).length;
}

async function sendProtectionLog(client, channelId, embed) {
  if (!channelId) return;
  const ch = await client.channels.fetch(channelId).catch(() => null);
  if (ch) ch.send({ embeds: [embed] }).catch(() => {});
}

// Envia DM ao dono com botões de Confirmar/Reverter
async function sendOwnerDM(client, actionTitle, description, onConfirm, onReject) {
  const owner = await client.users.fetch(process.env.OWNER_ID).catch(() => null);
  if (!owner) return;

  const uniqueId = Date.now();
  const embed = new EmbedBuilder()
    .setTitle(`⚠️ Ação Detetada: ${actionTitle}`)
    .setDescription(description)
    .setColor(0xFF4444)
    .setTimestamp()
    .setFooter({ text: 'Tens 30 segundos para decidir. Sem resposta = reverter.' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ownerDM_confirm_${uniqueId}`)
      .setLabel('✅ Confirmar / Permitir')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`ownerDM_reject_${uniqueId}`)
      .setLabel('❌ Reverter / Bloquear')
      .setStyle(ButtonStyle.Danger),
  );

  const dm = await owner.send({ embeds: [embed], components: [row] }).catch(() => null);
  if (!dm) return;

  const collector = dm.createMessageComponentCollector({ time: 30_000 });

  let handled = false;
  collector.on('collect', async i => {
    if (handled) return;
    handled = true;
    await i.deferUpdate().catch(() => {});

    if (i.customId.startsWith('ownerDM_confirm')) {
      await onConfirm?.();
      await i.message.edit({ content: '✅ Ação **permitida** pelo dono.', embeds: [], components: [] });
    } else {
      await onReject?.();
      await i.message.edit({ content: '🔄 Ação **revertida** pelo dono.', embeds: [], components: [] });
    }
    collector.stop();
  });

  collector.on('end', async () => {
    if (!handled) {
      handled = true;
      await onReject?.();
      await dm.edit({ content: '⏱️ Timeout — ação **revertida** automaticamente.', embeds: [], components: [] }).catch(() => {});
    }
  });
}

module.exports = { getCounter, countRecent, sendProtectionLog, sendOwnerDM };
