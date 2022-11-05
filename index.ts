import { config } from 'dotenv';
config();

import { initialize as initializeDatabase, ServerPlayingStatus } from './database';
import { loadMessageCommands, loadSlashCommands } from './commands';

import { syncSheets } from './sheets';

import { Client, IntentsBitField } from 'discord.js';
import { getConnection, In } from 'typeorm';
import { DiscordGatewayAdapterCreator, joinVoiceChannel, VoiceConnectionStatus, entersState } from '@discordjs/voice';
import { subscribeToPlayer } from './player';
export const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildVoiceStates
    ]
});

const slashCommands = loadSlashCommands(client);
const messageCommands = loadMessageCommands(client);

client.on('interactionCreate', (interaction) => {

    if (!interaction.isCommand()) return;

    const run = slashCommands.get(interaction.commandName);

    if (!run) {
        interaction.reply('Unknown command');
        return;
    }

    run(interaction, interaction.commandName);

});

client.on('messageCreate', (message) => {

    if (message.author.bot) return;

    if (!process.env.COMMAND_PREFIX) return;
    
    const args = message.content.slice(process.env.COMMAND_PREFIX.length).split(/ +/);
    const commandName = args.shift();

    if (!commandName) return;

    const run = messageCommands.get(commandName);
    
    if (!run) return;

    run(message, commandName);

});

client.on('ready', () => {
    console.log(`Logged in as ${client.user!.tag}. Ready to serve ${client.users.cache.size} users in ${client.guilds.cache.size} servers 🚀`);

    if (process.env.DB_NAME) {
        initializeDatabase().then(async () => {
            console.log('Database initialized 📦');

            const statuses = await getConnection().getRepository(ServerPlayingStatus).find();
            statuses.forEach((status) => {

                const guild = client.guilds.cache.get(status.guildId)!;
                if (!guild) return;
                const connection = joinVoiceChannel({
                    channelId: status.channelId,
                    guildId: status.guildId,
                    adapterCreator: guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
                });

                entersState(connection, VoiceConnectionStatus.Ready, 30e3).then(() => {
                    subscribeToPlayer(connection);
                });

            });
        });
    } else {
        console.log('Database not initialized, as no keys were specified 📦');
    }

    if (process.env.SPREADSHEET_ID) {
        syncSheets();
    }
});

client.login(process.env.DISCORD_CLIENT_TOKEN);
