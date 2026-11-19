
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
      console.log(`Role assigned to ${member.user.tag}`);
    } else {
      console.log('VILE: Role not found!');
    }

    // WELCOME CHANNEL
    const channel = member.guild.channels.cache.get(
      WELCOME_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) {
      console.log('VILE: Welcome channel not found!');
      return;
    }

    // WELCOME EMBED
    const welcomeEmbed = new EmbedBuilder()
      .setColor(COLOR)
      .setAuthor({
        name: 'VILE • COMMUNITY',
        iconURL: client.user.displayAvatarURL()
      })
      .setTitle('✦ A NEW SOUL HAS ARRIVED')
      .setDescription(
        `Welcome to **${member.guild.name}**!\n\n` +
        `We're glad to have you here, ${member}.\n` +
        `Make yourself comfortable and enjoy your stay.`
      )
      .setThumbnail(
        member.user.displayAvatarURL({
          size: 256
        })
      )
      .addFields(
        {
          name: '✧ MEMBER',
          value: `${member.user.username}`,
          inline: true
        },
        {
          name: '✧ MEMBERS',
          value: `${member.guild.memberCount}`,
          inline: true
        },
        {
          name: '✧ ACCOUNT CREATED',
          value: `<t:${Math.floor(
            member.user.createdTimestamp / 1000
          )}:D>`,
          inline: false
        }
      )
      .setFooter({
        text: 'VILE • Welcome to the community'
      })
      .setTimestamp();

    // SEND MESSAGE
    await channel.send({
      content: `Welcome ${member}!`,
      embeds: [welcomeEmbed]
    });

    console.log(`Welcome sent to ${member.user.tag}`);

  } catch (error) {
    console.error('VILE ERROR:', error);
  }
});

// ==============================
// LOGIN
// ==============================

client.login(process.env.TOKEN);
