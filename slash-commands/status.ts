import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { getConnection } from "typeorm";
import { SlashCommandRunFunction } from "../commands";
import { ServerPlayingStatus } from "../database";
import { errorEmbed, successEmbed } from "../util";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from '@discordjs/voice';
import { getCurrentlyPlaying, subscribeToPlayer } from "../player";

export const commands = [
    {
        name: "status",
        description: "Gets radio status in the server!"
    }
];

export const run: SlashCommandRunFunction = async (interaction) => {

    const status = await getConnection().getRepository(ServerPlayingStatus).findOne({
        guildId: interaction.guildId!
    }) ?? new ServerPlayingStatus();

    const embed = new MessageEmbed()
        .addField('Playing', status.playing ? 'Yes' : 'No')
        .addField('DJ Role', status.djRoleId ? `<@&${status.djRoleId}>` : 'None')
        .setColor(process.env.EMBED_COLOR);

    if (status.playing) {
        embed.addField('Channel', `<#${status.channelId}>`)
        .addField('Started by', `<@${status.starterUserId}>`)
        .addField('Content', getCurrentlyPlaying());
    }

    interaction.reply({
        embeds: [embed]
    });
}
