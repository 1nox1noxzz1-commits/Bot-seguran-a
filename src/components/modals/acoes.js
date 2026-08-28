const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emojis   = require('../../utils/emojis');
const database = require('../../utils/database');

module.exports = {
  customIdPrefix: 'modal_acoes_',

  async execute(interaction, client) {
    const tipo = interaction.customId.replace('modal_acoes_', '');

    if (tipo === 'mensagem') return saveMensagem(interaction);
    if (tipo === 'horas')    return saveHoras(interaction, client);
  },
};

async function saveMensagem(interaction) {
  const tipo     = interaction.fields.getTextInputValue('tipo').toLowerCase().trim();
  const mensagem = interaction.fields.getTextInputValue('mensagem');

  if (!['content', 'embed'].includes(tipo)) {
    return interaction.reply({ content: '❌ Tipo inválido. Usa `content` ou `embed`.', flags: (1 << 6) });
  }

  database.updateGuild(interaction.guild.id, { autoMessages: { message: mensagem, type: tipo } });

  const embed = new EmbedBuilder()
    .setColor(0x57F287)
    .setDescription(`✅ Mensagem guardada como tipo **${tipo}**.`)
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('acoes_mensagens')
      .setLabel('Voltar')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(emojis.voltar),
  );

  await interaction.reply({ embeds: [embed], components: [row], flags: (1 << 6) });
}

async function saveHoras(interaction, client) {
  const cron = interaction.fields.getTextInputValue('cron').trim();

  const parts = cron.split(' ');
  if (parts.length !== 5) {
    return interaction.reply({
      content: '❌ Cron inválido. Deve ter 5 campos (ex: `0 * * * *`).',
      flags: (1 << 6),
    });
  }

  const config = database.updateGuild(interaction.guild.id, { autoMessages: { cronExpression: cron } });

  if (config.autoMessages.enabled) {
    const scheduler = require('../../utils/scheduler');
    scheduler.startScheduler(client, interaction.guild.id, config.autoMessages);
  }

  const embed = new EmbedBuilder()
    .setColor(0x57F287)
    .setDescription(`✅ Intervalo definido: \`${cron}\``)
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('acoes_mensagens')
      .setLabel('Voltar')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(emojis.voltar),
  );

  await interaction.reply({ embeds: [embed], components: [row], flags: (1 << 6) });
}