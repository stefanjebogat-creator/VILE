
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
// VILE PODESAVANJA
// ==============================

const ROLE_ID = '1573097204862943262';
const WELCOME_CHANNEL_ID = '1573121519830171839';

const PREFIX = '!';

// ==============================
// BOT ONLINE
// ==============================

client.once(Events.ClientReady, (bot) => {
  console.log(`VILE je pokrenut kao ${bot.user.tag}!`);
});

// ==============================
// WELCOME SISTEM
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
      content: `**${member}** se upravo pridružio serveru **VILE**.`,
      allowedMentions: {
        users: [member.id]
      }
    });

  } catch (error) {
    console.error('Greška pri welcome sistemu:', error);
  }
});

// ==============================
// BAN I UNBAN KOMANDE
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
  // BAN KOMANDA
  // ============================

  if (command === 'ban') {

    if (!message.member.permissions.has(
      PermissionsBitField.Flags.BanMembers
    )) {
      return message.reply(
        'Nemate dozvolu za banovanje članova.'
      );
    }

    const userId = args[0];

    if (!userId) {
      return message.reply(
        'Korišćenje: `!ban ID razlog`'
      );
    }

    if (!/^\d{17,20}$/.test(userId)) return;

    const reason = args.slice(1).join(' ') || 'Razlog nije naveden';

    try {
      await message.guild.members.ban(userId, {
        reason: `${reason} | Banovao: ${message.author.tag}`
      });

      const channel = message.guild.channels.cache.get(
        WELCOME_CHANNEL_ID
      );

      if (channel && channel.isTextBased()) {
        await channel.send(
          `**Korisnik sa ID-em \`${userId}\` je banovan sa servera VILE.**\nRazlog: ${reason}`
        );
      }

      await message.reply(
        `Uspešno ste banovali korisnika sa ID-em \`${userId}\`.`
      );

      console.log(`Banovan korisnik: ${userId}`);

    } catch (error) {
      console.error('Greška pri banovanju:', error);

      await message.reply(
        'Banovanje nije uspelo. Proverite ID i dozvole bota.'
      );
    }
  }

  // ============================
  // UNBAN KOMANDA
  // ============================

  if (command === 'unban') {

    if (!message.member.permissions.has(
      PermissionsBitField.Flags.BanMembers
    )) {
      return message.reply(
        'Nemate dozvolu za skidanje bana.'
      );
    }

    const userId = args[0];

    if (!userId) {
      return message.reply(
        'Korišćenje: `!unban ID razlog`'
      );
    }

    if (!/^\d{17,20}$/.test(userId)) return;

    const reason = args.slice(1).join(' ') || 'Razlog nije naveden';

    try {
      await message.guild.members.unban(
        userId,
        `${reason} | Skinuo ban: ${message.author.tag}`
      );

      const channel = message.guild.channels.cache.get(
        WELCOME_CHANNEL_ID
      );

      if (channel && channel.isTextBased()) {
        await channel.send(
          `**Korisniku sa ID-em \`${userId}\` je skinut ban na serveru VILE.**\nRazlog: ${reason}`
        );
      }

      await message.reply(
        `Uspešno ste skinuli ban korisniku sa ID-em \`${userId}\`.`
      );

      console.log(`Skinut ban korisniku: ${userId}`);

    } catch (error) {
      console.error('Greška pri skidanju bana:', error);

      await message.reply(
        'Skidanje bana nije uspelo. Proverite ID i da li je korisnik banovan.'
      );
    }
  }
});

// ==============================
// POKRETANJE BOTA
// ==============================

client.login(process.env.TOKEN);
