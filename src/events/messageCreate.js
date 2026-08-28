const { EmbedBuilder } = require('discord.js');
const { getGuild }     = require('../utils/database');
const { analyzeWithGrok } = require('../utils/grok');

// Padrões de spam detectáveis localmente (antes de chamar IA)
const SPAM_PATTERNS = [
  /﷽{3,}/,           // spam unicode árabe
  /(.)\1{20,}/,       // carácter repetido 20+ vezes
  /https?:\/\/\S+/gi, // excesso de links (verificar com IA)
];

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const config = getGuild(message.guild.id);
    const ia     = config.ia;
    if (!ia.enabled || !ia.apiKey) return;

    // ── Deteção local de spam ─────────────────────────────────
    const isLocalSpam = SPAM_PATTERNS.some(p => p.test(message.content));
    if (isLocalSpam) {
      await deleteAndLog(client, message, ia, '🤖 Spam Automático', 'Padrão de spam detetado localmente.');
      return;
    }

    // ── Análise de imagens via Grok ───────────────────────────
    const imageAttachment = message.attachments.find(a =>
      a.contentType?.startsWith('image/')
    );

    if (imageAttachment) {
      try {
        // Descarregar imagem como base64
        const res    = await fetch(imageAttachment.url);
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');

        const result = await analyzeWithGrok(ia.apiKey, ia.model, ia.prompt, null, base64);

        if (result.harmful) {
          await deleteAndLog(client, message, ia, '🖼️ Imagem Prejudicial', result.reason, imageAttachment.url);
        }
      } catch (err) {
        console.error('[IA] Erro ao analisar imagem:', err);
      }
      return;
    }

    // ── Análise de texto via Grok (apenas se tiver conteúdo) ──
    if (message.content.length < 5) return;

    try {
      const result = await analyzeWithGrok(ia.apiKey, ia.model, ia.prompt, message.content);
      if (result.harmful) {
        await deleteAndLog(client, message, ia, '📝 Mensagem Prejudicial', result.reason);
      }
    } catch (err) {
      console.error('[IA] Erro ao analisar mensagem:', err);
    }
  },
};

async function deleteAndLog(client, message, ia, title, reason, imageUrl = null) {
  // Apagar mensagem
  await message.delete().catch(() => {});

  // Log no canal de IA
  if (!ia.logChannel) return;
  const logCh = await client.channels.fetch(ia.logChannel).catch(() => null);
  if (!logCh) return;

  const embed = new EmbedBuilder()
    .setColor(0xFF4444)
    .setTitle(title)
    .addFields(
      { name: '👤 Utilizador', value: `${message.author.tag} (${message.author.id})`, inline: true },
      { name: '📌 Canal',      value: `<#${message.channel.id}>`,                       inline: true },
      { name: '❓ Motivo',     value: reason || 'Não especificado' },
    )
    .setTimestamp();

  if (message.content)  embed.addFields({ name: '💬 Conteúdo', value: message.content.slice(0, 1024) });
  if (imageUrl)         embed.setImage(imageUrl);

  await logCh.send({ embeds: [embed] }).catch(() => {});
}
