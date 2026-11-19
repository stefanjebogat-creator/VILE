
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Events
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ==============================
// VILE CONFIGURATION
// ==============================

const ROLE_ID = '1573097204862943262';
const WELCOME_CHANNEL_ID = '1573121519830171839';

const COLOR = 0x56015A;

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
    // AUTOMATIC ROLE
    const role = member.guild.roles.cache.get(ROLE_ID);

    if (role) {
      await member.roles.add(role);
    }

    // WELCOME CHANNEL
    const channel = member.guild.channels.cache.get(
      WELCOME_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) return;

    // SIMPLE WELCOME MESSAGE
    await channel.send({
      content: `✦ **${member.user.username}** just joined **VILE**.\nGlad to have you here.`,
      allowedMentions: { parse: [] }
    });

  } catch (error) {
    console.error('VILE ERROR:', error);
  }
});


// ==============================
// LOGIN
// ==============================

client.login(process.env.TOKEN);
