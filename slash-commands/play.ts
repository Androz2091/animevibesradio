import { CommandInteraction, GuildMember } from "discord.js";
import { getConnection } from "typeorm";
import { SlashCommandRunFunction } from "../commands";
import { ServerPlayingStatus } from "../database";
import { errorEmbed, successEmbed } from "../util";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from '@discordjs/voice';
import { subscribeToPlayer } from "../player";

export const commands = [
    {
        name: "play",
        description: "Starts playing the radio in the server!"
    }
];

export const run: SlashCommandRunFunction = async (interaction) => {

    const member = interaction.member as GuildMember;

    const status = await getConnection().getRepository(ServerPlayingStatus).findOne({
        guildId: member.guild.id
    });
    
    if (!member.permissions.has("ADMINISTRATOR") && (!status?.djRoleId || !member.roles.cache.has(status.djRoleId))) {
        return interaction.reply(errorEmbed("You need to be an administrator or DJ to use this command!"));
    }

    if (!member.voice.channel) {
        return interaction.reply(errorEmbed("You must be in a voice channel to play the radio!"));
    }

    if (status) {
        await getConnection().getRepository(ServerPlayingStatus).update(status.id, {
            guildId: member.guild.id,
            playing: true,
            channelId: member.voice.channel.id,
            starterUserId: member.id
        });
    } else {
        await getConnection().getRepository(ServerPlayingStatus).insert({
            guildId: member.guild.id,
            playing: true,
            channelId: member.voice.channel.id,
            starterUserId: member.id
        });
    }

    const connection = joinVoiceChannel({
        guildId: member.guild.id!,
        channelId: member.voice!.channelId!,
        adapterCreator: member.guild.voiceAdapterCreator! as DiscordGatewayAdapterCreator
    });

    subscribeToPlayer(connection);

    return interaction.reply(successEmbed("Now playing the radio!"));
    
}
