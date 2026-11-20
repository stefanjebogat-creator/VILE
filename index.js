
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  Events
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

const PREFIX = '!';

// ==============================
// BOT READY
// ==============================

client.once(Events.ClientReady, (bot) => {
  console.log(`VILE is online as ${bot.user.tag}`);
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
    console.error('VILE WELCOME ERROR:', error);
  }
});

// ==============================
// BAN & UNBAN COMMANDS
// ==============================

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  // ============================
  // BAN COMMAND
  // ============================

  if (command === 'ban') {
    if (!message.member.permissions.has(
      PermissionsBitField.Flags.BanMembers
    )) {
      return message.reply('You do not have permission to ban members.');
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply('Usage: `!ban @user [reason]`');
    }

    if (!target.bannable) {
      return message.reply('I cannot ban this member. Check my role position and permissions.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await target.ban({ reason });

      const channel = message.guild.channels.cache.get(
        WELCOME_CHANNEL_ID
      );

      if (channel) {
        await channel.send({
          content: `**${target.user.tag}** was banned from **VILE**.\nReason: ${reason}`
        });
      }

      await message.reply(`Successfully banned **${target.user.tag}**.`);

    } catch (error) {
      console.error('VILE BAN ERROR:', error);
      await message.reply('Failed to ban this member.');
    }
  }

  // ============================
  // UNBAN COMMAND
  // ============================

  if (command === 'unban') {
    if (!message.member.permissions.has(
      PermissionsBitField.Flags.BanMembers
    )) {
      return message.reply('You do not have permission to unban members.');
    }

    const userId = args[0];

    if (!userId || !/^\d{17,20}$/.test(userId)) {
      return message.reply('Usage: `!unban USER_ID [reason]`');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await message.guild.members.unban(userId, reason);

      const channel = message.guild.channels.cache.get(
        WELCOME_CHANNEL_ID
      );

      if (channel) {
        await channel.send({
          content: `**<@${userId}>** was unbanned from **VILE**.\nReason: ${reason}`,
          allowedMentions: { parse: [] }
        });
      }

      await message.reply(`Successfully unbanned user **${userId}**.`);

    } catch (error) {
      console.error('VILE UNBAN ERROR:', error);
      await message.reply('Failed to unban this user. Check the ID and ban list.');
    }
  }
});

// ==============================
// LOGIN
// ==============================

client.login(process.env.TOKEN);
