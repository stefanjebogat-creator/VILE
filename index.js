
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
// VILE PODESAVANJA
// ==============================

const ROLE_ID = '1573097204862943262';
const WELCOME_CHANNEL_ID = '1573121519830171839';
const MODLOG_CHANNEL_ID = '1573136589737951283';

const PREFIX = '!';
const COLOR = 0x56015A;

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
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Nemate dozvolu za banovanje članova.');

      return message.reply({ embeds: [embed] });
    }

    const mentionedUser = message.mentions.users.first();
    const userId = mentionedUser?.id || args[0];

    if (!userId) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(
          'Korišćenje: `!ban ID razlog`\nIli: `!ban @korisnik razlog`'
        );

      return message.reply({ embeds: [embed] });
    }

    if (!/^\d{17,20}$/.test(userId)) return;

    const reason = args.slice(1).join(' ') || 'Razlog nije naveden';

    try {
      await message.guild.members.ban(userId, {
        reason: `${reason} | Banovao: ${message.author.tag}`
      });

      const channel = message.guild.channels.cache.get(
        MODLOG_CHANNEL_ID
      );

      if (channel && channel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor(COLOR)
          .setTitle('Korisnik je banovan')
          .addFields(
            {
              name: 'Korisnik',
              value: `\`${userId}\``,
              inline: false
            },
            {
              name: 'Razlog',
              value: reason,
              inline: false
            }
          )
          .setFooter({ text: 'VILE • Moderacija' })
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      }

      const successEmbed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(
          `Uspešno ste banovali korisnika sa ID-em \`${userId}\`.`
        );

      await message.reply({ embeds: [successEmbed] });

      console.log(`Banovan korisnik: ${userId}`);

    } catch (error) {
      console.error('Greška pri banovanju:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(
          'Banovanje nije uspelo. Proverite ID i dozvole bota.'
        );

      await message.reply({ embeds: [errorEmbed] });
    }
  }

  // ============================
  // UNBAN KOMANDA
  // ============================

  if (command === 'unban') {

    if (!message.member.permissions.has(
      PermissionsBitField.Flags.BanMembers
    )) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription('Nemate dozvolu za skidanje bana.');

      return message.reply({ embeds: [embed] });
    }

    const userId = args[0];

    if (!userId) {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(
          'Korišćenje: `!unban ID razlog`'
        );

      return message.reply({ embeds: [embed] });
    }

    if (!/^\d{17,20}$/.test(userId)) return;

    const reason = args.slice(1).join(' ') || 'Razlog nije naveden';

    try {
      await message.guild.members.unban(
        userId,
        `${reason} | Skinuo ban: ${message.author.tag}`
      );

      const channel = message.guild.channels.cache.get(
        MODLOG_CHANNEL_ID
      );

      if (channel && channel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor(COLOR)
          .setTitle('Korisniku je skinut ban')
          .addFields(
            {
              name: 'Korisnik',
              value: `\`${userId}\``,
              inline: false
            },
            {
              name: 'Razlog',
              value: reason,
              inline: false
            }
          )
          .setFooter({ text: 'VILE • Moderacija' })
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      }

      const successEmbed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(
          `Uspešno ste skinuli ban korisniku sa ID-em \`${userId}\`.`
        );

      await message.reply({ embeds: [successEmbed] });

      console.log(`Skinut ban korisniku: ${userId}`);

    } catch (error) {
      console.error('Greška pri skidanju bana:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor(COLOR)
        .setDescription(
          'Skidanje bana nije uspelo. Proverite ID i da li je korisnik banovan.'
        );

      await message.reply({ embeds: [errorEmbed] });
    }
  }
});

// ==============================
// POKRETANJE BOTA
// ==============================

client.login(process.env.TOKEN);
