
process.loadEnvFile();

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// ID role koju bot dodeljuje
const ROLE_ID = '1573097204862943262';

// Kada se bot poveže
client.once('ready', () => {
    console.log(`${client.user.tag} je online!`);
});

// Automatsko dodeljivanje role novom članu
client.on('guildMemberAdd', async (member) => {
    try {
        await member.roles.add(ROLE_ID);
        console.log(`Role assigned to ${member.user.tag}`);
    } catch (error) {
        console.error('Greska pri dodeljivanju role:', error);
    }
});

// Provera tokena
if (!process.env.TOKEN) {
    console.error('TOKEN nije pronadjen u .env fajlu!');
    process.exit(1);
}

// Pokretanje bota
client.login(process.env.TOKEN);
