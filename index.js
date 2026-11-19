
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const ROLE_ID = '1573097204862943262';

client.once('ready', () => {
    console.log(`${client.user.tag} je online!`);
});

client.on('guildMemberAdd', async (member) => {
    try {
        await member.roles.add(ROLE_ID);
        console.log(`Role assigned to ${member.user.tag}`);
    } catch (error) {
        console.error('Greska:', error);
    }
});

client.login(process.env.TOKEN);
