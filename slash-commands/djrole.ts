import { CommandInteraction, CommandInteractionOptionResolver, GuildMember, PermissionsBitField } from "discord.js";
import { getConnection } from "typeorm";
import { SlashCommandRunFunction } from "../commands";
import { ServerPlayingStatus } from "../database";
import { errorEmbed, successEmbed } from "../util";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from '@discordjs/voice';
import { getCurrentlyPlaying, subscribeToPlayer } from "../player";
import { ApplicationCommandOptionType } from "discord-api-types";

export const commands = [
    {
        name: "djrole",
        description: "Change the configured DJ role on the server",
        options: [
            {
                name: "role",
                description: "The role to set as DJ",
                required: true,
                type: ApplicationCommandOptionType.Role
            }
        ]
    }
];

export const run: SlashCommandRunFunction = async (interaction) => {

    if (!(interaction.member as GuildMember).permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply(errorEmbed("You need to be an administrator to use this command!"));
    }

    const status = await getConnection().getRepository(ServerPlayingStatus).findOne({
        guildId: interaction.guildId!
    });

    const role = (interaction.options as CommandInteractionOptionResolver).getRole("role")!;

    if (status) {
        await getConnection().getRepository(ServerPlayingStatus).update(status.id, {
            djRoleId: role.id
        });
    } else {
        await getConnection().getRepository(ServerPlayingStatus).insert({
            guildId: interaction.guildId!,
            djRoleId: role.id
        });
    }

    return interaction.reply(successEmbed("DJ role has been updated!"));
}
