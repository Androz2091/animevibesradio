import { CommandInteraction, GuildMember } from "discord.js";
import { getConnection } from "typeorm";
import { SlashCommandRunFunction } from "../commands";
import { ServerPlayingStatus } from "../database";
import { errorEmbed, successEmbed } from "../util";
import { DiscordGatewayAdapterCreator, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { subscribeToPlayer } from "../player";
import { ApplicationCommandOptionType } from "discord-api-types";

export const commands = [
    {
        name: "stop",
        description: "Stops the currently playing song"
    }
];

export const run: SlashCommandRunFunction = async (interaction) => {

    const member = interaction.member as GuildMember;

    const status = await getConnection().getRepository(ServerPlayingStatus).findOne({
        guildId: interaction.guildId!
    }) ?? new ServerPlayingStatus();
    
    if (!member.permissions.has("ADMINISTRATOR") && (!status?.djRoleId || !member.roles.cache.has(status.djRoleId))) {
        return interaction.reply(errorEmbed("You need to be an administrator or DJ to use this command!"));
    }

    getVoiceConnection(member.guild.id!)?.destroy();

    await getConnection().getRepository(ServerPlayingStatus).update({
        guildId: member.guild.id,
    }, {
        playing: false
    });

    return interaction.reply(successEmbed("Just stopped the radio!"));
    
}
