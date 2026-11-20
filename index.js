
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
        `**Online for:**\n` +
        `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds.`
      )
      .setFooter({ text: 'VILE • System' })
      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: { parse: [] }
    });
  }
