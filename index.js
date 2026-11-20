
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

const ROLE_ID = '1573097204862943262';
const WELCOME_CHANNEL_ID = '1573121519830171839';
const MODLOG_CHANNEL_ID = '1573136589737951283';

const PREFIX = '!';
const COLOR = 0x56015A;

// BOT READY
client.once(Events.ClientReady, (bot) => {
  console.log(`VILE is online as ${bot.user.tag}!`);
});

// WELCOME + AUTO ROLE
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const role = member.guild.roles.cache.get(ROLE_ID);

    if (role) {
      await member.roles.add(role);
    }

    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);

    if (!channel || !channel.isTextBased()) return;

    await channel.send({
      content: `**${member}** just joined **VILE**.`,
      allowedMentions: { users: [member.id] }
    });

  } catch (error) {
    console.error('Welcome system error:', error);
  }
});

// COMMANDS
client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  // BAN
  if (command === 'ban') {
    const userId = message.mentions.users.first()?.id || args[0];

    if (!userId) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Usage: `!ban ID reason` or `!ban @user reason`');

      return message.channel.send({ embeds: [embed] });
    }

    if (!/^\d{17,20}$/.test(userId)) return;

    const reason = args.slice(message.mentions.users.first() ? 0 : 1).join(' ') || 'No reason provided.';

    try {
      await message.guild.members.ban(userId, {
        reason: `Banned by: ${message.author.tag} | Reason: ${reason}`
      });

      const logChannel = message.guild.channels.cache.get(MODLOG_CHANNEL_ID);

      if (logChannel && logChannel.isTextBased()) {
        const logEmbed = new EmbedBuilder()
          .setColor(COLOR)
          .setTitle('Member Banned')
          .addFields(
            { name: 'User', value: `<@${userId}>` },
            { name: 'Reason', value: reason }
          )
          .setTimestamp();

        await logChannel.send({
          embeds: [logEmbed],
          allowedMentions: { parse: [] }
        });
      }

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(`Successfully banned user <@${userId}>.`);

      return message.channel.send({
        embeds: [embed],
        allowedMentions: { parse: [] }
      });

    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Failed to ban this user.');

      return message.channel.send({ embeds: [embed] });
    }
  }

  // UNBAN
  if (command === 'unban') {
    const userId = args[0];

    if (!userId) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Usage: `!unban ID reason`');

      return message.channel.send({ embeds: [embed] });
    }

    if (!/^\d{17,20}$/.test(userId)) return;

    const reason = args.slice(1).join(' ') || 'No reason provided.';

    try {
      await message.guild.members.unban(
        userId,
        `Unbanned by: ${message.author.tag} | Reason: ${reason}`
      );

      const logChannel = message.guild.channels.cache.get(MODLOG_CHANNEL_ID);

      if (logChannel && logChannel.isTextBased()) {
        const logEmbed = new EmbedBuilder()
          .setColor(COLOR)
          .setTitle('Member Unbanned')
          .addFields(
            { name: 'User', value: `<@${userId}>` },
            { name: 'Reason', value: reason }
          )
          .setTimestamp();

        await logChannel.send({
          embeds: [logEmbed],
          allowedMentions: { parse: [] }
        });
      }

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(`Successfully unbanned user <@${userId}>.`);

      return message.channel.send({
        embeds: [embed],
        allowedMentions: { parse: [] }
      });

    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Failed to unban this user.');

      return message.channel.send({ embeds: [embed] });
    }
  }

  // CLEAR
  if (command === 'clear') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('You do not have permission to use this command.');

      return message.channel.send({ embeds: [embed] });
    }

    if (!message.guild.members.me.permissionsIn(message.channel).has([
      PermissionsBitField.Flags.ManageMessages,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.ViewChannel
    ])) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR)
            .setDescription('I do not have the required permissions.')
        ]
      });
    }

    const amount = parseInt(args[0], 10);

    if (!Number.isInteger(amount) || amount < 1 || amount > 100) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Usage: `!clear 1-100`');

      return message.channel.send({ embeds: [embed] });
    }

    try {
      const messages = await message.channel.messages.fetch({ limit: 100 });

      const toDelete = messages
        .filter(msg => msg.id !== message.id)
        .filter(msg => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000)
        .first(amount);

      const deleted = await message.channel.bulkDelete(toDelete, true);

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(`Successfully deleted **${deleted.size}** messages.`);

      const confirmation = await message.channel.send({ embeds: [embed] });

      setTimeout(() => {
        confirmation.delete().catch(() => {});
      }, 5000);

    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Failed to delete messages.');

      return message.channel.send({ embeds: [embed] });
    }
  }

  // AVATAR (!avatar / !av)
  if (command === 'avatar' || command === 'av') {
    let user;

    try {
      const userId = message.mentions.users.first()?.id || args[0];

      user = userId
        ? await client.users.fetch(userId, { force: true })
        : await client.users.fetch(message.author.id, { force: true });

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

  // BANNER
  if (command === 'banner') {
    let user;

    try {
      const userId = message.mentions.users.first()?.id || args[0];

      user = userId
        ? await client.users.fetch(userId, { force: true })
        : await client.users.fetch(message.author.id, { force: true });

    } catch {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('User not found.');

      return message.channel.send({ embeds: [embed] });
    }

    const bannerURL = user.bannerURL({ size: 4096 });

    if (!bannerURL) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('This user does not have a banner.');

      return message.channel.send({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(`${user.username}'s Banner`)
      .setImage(bannerURL)
      .setFooter({ text: 'VILE • Banner' })
      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { parse: [] }
    });
  }

  // ANNOUNCE
  if (command === 'announce') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
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

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { parse: [] }
    });
  }

  // UPTIME
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

client.login(process.env.TOKEN);
