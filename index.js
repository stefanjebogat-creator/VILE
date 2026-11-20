
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  Events,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ==============================
// VILE CONFIGURATION
// ==============================

const ROLE_ID = '1573097204862943262';
const WELCOME_CHANNEL_ID = '1573121519830171839';
const MODLOG_CHANNEL_ID = '1573136589737951283';

const PREFIX = '!';
const COLOR = 0x56015A;

// ==============================
// BOT READY
// ==============================

client.once(Events.ClientReady, (bot) => {
  console.log(`VILE is online as ${bot.user.tag}!`);
});

// ==============================
// WELCOME SYSTEM
// ==============================

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const role = member.guild.roles.cache.get(ROLE_ID);

    if (role) {
      await member.roles.add(role);
    }

    const channel = member.guild.channels.cache.get(
      WELCOME_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) return;

    await channel.send({
      content: `**${member}** just joined **VILE**.`,
      allowedMentions: {
        users: [member.id]
      }
    });

  } catch (error) {
    console.error('Welcome system error:', error);
  }
});

// ==============================
// COMMANDS
// ==============================

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content
    .slice(PREFIX.length)
    .trim()
    .split(/ +/);

  const command = args.shift()?.toLowerCase();

  // ============================
  // BAN COMMAND
  // ============================

  if (command === 'ban') {

    if (!message.member.permissions.has(
      PermissionsBitField.Flags.BanMembers
    )) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('You do not have permission to ban members.');

      return message.channel.send({
        embeds: [embed],
        allowedMentions: { parse: [] }
      });
    }

    const mentionedUser = message.mentions.users.first();
    const userId = mentionedUser?.id || args[0];

    if (!userId) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(
          'Usage: `!ban ID reason`\nOr: `!ban @user reason`'
        );

      return message.channel.send({
        embeds: [embed],
        allowedMentions: { parse: [] }
      });
    }

    if (!/^\d{17,20}$/.test(userId)) return;

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await message.guild.members.ban(userId, {
        reason: `${reason} | Banned by: ${message.author.tag}`
      });

      const channel = message.guild.channels.cache.get(
        MODLOG_CHANNEL_ID
      );

      if (channel && channel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor(COLOR)
          .setTitle('Member Banned')
          .addFields(
            { name: 'User', value: `<@${userId}>` },
            { name: 'Reason', value: reason }
          )
          .setFooter({ text: 'VILE • Moderation' })
          .setTimestamp();

        await channel.send({
          embeds: [embed],
          allowedMentions: { parse: [] }
        });
      }

      const successEmbed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(
          `Successfully banned user <@${userId}>.`
        );

      await message.channel.send({
        embeds: [successEmbed],
        allowedMentions: { parse: [] }
      });

      console.log(`Banned user: ${userId}`);

    } catch (error) {
      console.error('Ban error:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(
          'Failed to ban the user. Check the ID and bot permissions.'
        );

      await message.channel.send({
        embeds: [errorEmbed],
        allowedMentions: { parse: [] }
      });
    }
  }

  // ============================
  // UNBAN COMMAND
  // ============================

  if (command === 'unban') {

    if (!message.member.permissions.has(
      PermissionsBitField.Flags.BanMembers
    )) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('You do not have permission to unban members.');

      return message.channel.send({
        embeds: [embed],
        allowedMentions: { parse: [] }
      });
    }

    const userId = args[0];

    if (!userId) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Usage: `!unban ID reason`');

      return message.channel.send({
        embeds: [embed],
        allowedMentions: { parse: [] }
      });
    }

    if (!/^\d{17,20}$/.test(userId)) return;

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await message.guild.members.unban(
        userId,
        `${reason} | Unbanned by: ${message.author.tag}`
      );

      const channel = message.guild.channels.cache.get(
        MODLOG_CHANNEL_ID
      );

      if (channel && channel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor(COLOR)
          .setTitle('Member Unbanned')
          .addFields(
            { name: 'User', value: `<@${userId}>` },
            { name: 'Reason', value: reason }
          )
          .setFooter({ text: 'VILE • Moderation' })
          .setTimestamp();

        await channel.send({
          embeds: [embed],
          allowedMentions: { parse: [] }
        });
      }

      const successEmbed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(
          `Successfully unbanned user <@${userId}>.`
        );

      await message.channel.send({
        embeds: [successEmbed],
        allowedMentions: { parse: [] }
      });

      console.log(`Unbanned user: ${userId}`);

    } catch (error) {
      console.error('Unban error:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(
          'Failed to unban the user. Check the ID and whether the user is banned.'
        );

      await message.channel.send({
        embeds: [errorEmbed],
        allowedMentions: { parse: [] }
      });
    }
  }

  // ============================
  // CLEAR COMMAND
  // ============================

  if (command === 'clear') {

    if (!message.member.permissions.has(
      PermissionsBitField.Flags.ManageMessages
    )) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR)
            .setDescription('You do not have permission to delete messages.')
        ]
      });
    }

    const botPermissions = message.channel.permissionsFor(
      message.guild.members.me
    );

    if (!botPermissions.has([
      PermissionsBitField.Flags.ManageMessages,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.ViewChannel
    ])) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR)
            .setDescription('The bot is missing permissions to delete messages.')
        ]
      });
    }

    const amount = Number(args[0]);

    if (!args[0]) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR)
            .setDescription('Usage: `!clear amount`\nExample: `!clear 50`')
        ]
      });
    }

    if (!Number.isInteger(amount) || amount < 1 || amount > 100) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR)
            .setDescription('Please enter a number between 1 and 100.')
        ]
      });
    }

    try {
      const messages = await message.channel.messages.fetch({
        limit: 100
      });

      const toDelete = messages
        .filter(msg => msg.id !== message.id)
        .filter(msg => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000)
        .first(amount);

      let deletedCount = 0;

      if (toDelete.length > 0) {
        const deleted = await message.channel.bulkDelete(
          toDelete,
          true
        );

        deletedCount = deleted.size;
      }

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(
          `Successfully deleted **${deletedCount}** messages.`
        );

      const confirmation = await message.channel.send({
        embeds: [embed],
        allowedMentions: { parse: [] }
      });

      setTimeout(() => {
        confirmation.delete().catch(() => {});
      }, 5000);

    } catch (error) {
      console.error('Clear error:', error);

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(
          `Failed to delete messages. Error: \`${error.code || error.message}\``
        );

      await message.channel.send({
        embeds: [embed],
        allowedMentions: { parse: [] }
      });
    }
  }

  // ============================
  // AVATAR COMMAND
  // ============================

  if (command === 'avatar') {
    let user;

    try {
      const userId = message.mentions.users.first()?.id || args[0];

      user = userId
        ? await client.users.fetch(userId)
        : message.author;

    } catch {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('User not found.');

      return message.channel.send({ embeds: [embed] });
    }

    const avatarURL = user.displayAvatarURL({
      size: 4096,
      extension: 'png'
    });

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(`${user.username}'s Avatar`)
      .setImage(avatarURL)
      .setFooter({ text: 'VILE • Avatar' })
      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { parse: [] }
    });
  }

  // ============================
  // ANNOUNCE COMMAND
  // ============================

  if (command === 'announce') {

    if (!message.member.permissions.has(
      PermissionsBitField.Flags.ManageMessages
    )) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('You do not have permission to make announcements.');

      return message.channel.send({ embeds: [embed] });
    }

    const announcement = args.join(' ');

    if (!announcement) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Usage: `!announce message`');

      return message.channel.send({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle('VILE • Announcement')
      .setDescription(announcement)
      .setFooter({ text: 'VILE • Community' })
      .setTimestamp();

    await message.channel.send({
      embeds: [embed],
      allowedMentions: { parse: [] }
    });
  }

  // ============================
  // UPTIME COMMAND
  // ============================

  if (command === 'uptime') {

    const totalSeconds = Math.floor(client.uptime / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle('VILE • Bot Uptime')
      .setDescription(
        `**Online for:**\n${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds.`
      )
      .setFooter({ text: 'VILE • System' })
      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { parse: [] }
    });
  }
});

// ==============================
// BOT LOGIN
// ==============================

client.login(process.env.TOKEN);
