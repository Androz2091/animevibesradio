import { CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
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

    const embed = new EmbedBuilder()
        .addFields([
            { name: 'Playing', value: status.playing ? 'Yes' : 'No' },
            { name: 'DJ', value: status.djRoleId ? `<@&${status.djRoleId}>` : 'None' },
        ])
        .setColor(process.env.EMBED_COLOR);

    if (status.playing) {
        embed.addFields([
            { name: 'Channel', value: `<#${status.channelId}>` },
            { name: 'Started by', value: `<@${status.starterUserId}>` },
            { name: 'Content', value: getCurrentlyPlaying() }
        ]);
    }

    interaction.reply({
        embeds: [embed]
    });
}
