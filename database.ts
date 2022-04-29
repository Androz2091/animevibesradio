import { Entity, Column, createConnection, Connection, PrimaryGeneratedColumn } from "typeorm";

export const initialize = () => createConnection({
    type: 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [ServerPlayingStatus],
    synchronize: process.env.ENVIRONMENT === 'development',
});

@Entity()
export class ServerPlayingStatus {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    playing!: boolean;

    @Column({
        length: 32
    })
    guildId!: string;

    @Column({
        length: 32,
        nullable: true
    })
    channelId!: string;

    @Column({
        length: 32,
        nullable: true
    })
    starterUserId!: string;

    @Column({
        length: 32,
        nullable: true
    })
    djRoleId!: string;

    @Column({
        default: 100
    })
    volume!: number;
}
