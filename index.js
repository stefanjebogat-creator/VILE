
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
    const mentionedUser = message.mentions.users.first();
    const userId = mentionedUser?.id || args[0];

    if (!userId) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Usage: `!ban ID reason` or `!ban @user reason`');

      return message.channel.send({ embeds: [embed] });
    }

    if (!/^\d{17,20}$/.test(userId)) return;

    const reason = args.slice(mentionedUser ? 1 : 1).join(' ') || 'No reason provided.';

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

  // SHIP
  if (command === 'ship') {
    const users = [...message.mentions.users.values()];

    if (users.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Usage: `!ship @user` or `!ship @user @user`');

      return message.channel.send({ embeds: [embed] });
    }

    const firstUser = users.length >= 2 ? users[0] : message.author;
    const secondUser = users.length >= 2 ? users[1] : users[0];

    const percentage = Math.floor(Math.random() * 101);

    let shipMessage;

    if (percentage >= 90) {
      shipMessage = 'A perfect match! ❤️';
    } else if (percentage >= 70) {
      shipMessage = 'There is definitely something special here! 💕';
    } else if (percentage >= 40) {
      shipMessage = 'There might be a chance! 💗';
    } else {
      shipMessage = 'Maybe better as friends! 😂';
    }

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle('VILE • Love Calculator')
      .setDescription(
        `💘 **${firstUser.username}** + **${secondUser.username}**\n\n` +
        `**Love percentage:** ${percentage}%\n\n${shipMessage}`
      )
      .setFooter({ text: 'VILE • Fun' })
      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { parse: [] }
    });
  }

  // HUG
  if (command === 'hug') {
    const target = message.mentions.users.first();

    if (!target) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Usage: `!hug @user`');

      return message.channel.send({ embeds: [embed] });
    }

    const hugMessages = [
      'sent a warm hug to',
      'gave a big hug to',
      'is sending lots of love to',
      'gave a cozy hug to'
    ];

    const randomMessage = hugMessages[
      Math.floor(Math.random() * hugMessages.length)
    ];

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setDescription(
        `🤗 **${message.author.username}** ${randomMessage} **${target.username}**! ❤️`
      )
      .setFooter({ text: 'VILE • Fun' })
      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { parse: [] }
    });
  }

  // ROAST
  if (command === 'roast') {
    const target = message.mentions.users.first();

    if (!target) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Usage: `!roast @user`');

      return message.channel.send({ embeds: [embed] });
    }

    if (target.id === message.author.id) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('You cannot roast yourself. 😂');

      return message.channel.send({ embeds: [embed] });
    }

   const roastMessages = [
  'ima manje mozga nego što telefon ima memorije. 💀',
  'kad razmišlja, čuje se zvuk greške.',
  'toliko je spor da ga i puž čeka.',
  'ima više sreće nego pameti.',
  'čak bi i Google odustao od pokušaja da ga razume.',
  'kad bi glupost bila sport, bio bi svetski šampion. 🏆',
  'ima dve leve ruke i tri leve noge.',
  'nije on glup, samo mu je mozak na odmoru.',
  'toliko je izgubljen da bi se izgubio i u sopstvenoj sobi.',
  'njegov mozak radi na probnoj verziji.',
  'kad uđe u sobu, IQ automatski padne za 50.',
  'ima više bagova nego Windows bez ažuriranja.',
  'čak ga ni mama ne razume ponekad. 😂',
  'da je ćutanje zlato, on bi bio milioner.',
  'toliko je spor da mu poruka stigne pre nego što je pošalje.',
  'nije problem što ne zna, nego što je siguran da zna.'
];

    const randomRoast = roastMessages[
      Math.floor(Math.random() * roastMessages.length)
    ];

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle('VILE • Roast')
      .setDescription(`🔥 **${target.username}** ${randomRoast}`)
      .setFooter({ text: 'VILE • Just for fun' })
      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { parse: [] }
    });
  }
});

client.login(process.env.TOKEN);
