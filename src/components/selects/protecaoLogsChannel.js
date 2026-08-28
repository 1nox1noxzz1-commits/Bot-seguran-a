const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
} = require('discord.js');
const emojis   = require('../../utils/emojis');
const database = require('../../utils/database');

const IS_COMPONENTS_V2 = 1 << 15;

module.exports = {
  customIdPrefix: 'prot_logs_channel_select_',

  async execute(interaction) {
    const tipo      = interaction.customId.replace('prot_logs_channel_select_', '');
    const channelId = interaction.values[0];

    database.updateGuild(interaction.guild.id, { protection: { [tipo]: { logChannel: channelId } } });

    const container = new ContainerBuilder()
      .setAccentColor(0x57F287)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `✅ Canal de logs definido para <#${channelId}>.`
        )
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('painel_protecao')
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emojis.voltar),
        )
      );

    await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
  },
};