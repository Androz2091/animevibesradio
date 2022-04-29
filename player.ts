import { AudioPlayerStatus, createAudioPlayer, createAudioResource, NoSubscriberBehavior, VoiceConnection } from "@discordjs/voice";
import { readdirSync } from "fs";
import { join } from "path";

const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Play
    }
});

// read the medias that contain mp3 files
let medias = readdirSync("./medias/");
let randomMedias = medias.sort(() => Math.random() - 0.5);

let currentlyPlaying = '';
export let getCurrentlyPlaying = () => currentlyPlaying;

let idx = 0;
const getNextMedia = () => {

    const newMedias = readdirSync("./medias/");
    if (newMedias.length !== medias.length) {
        medias = newMedias;
        randomMedias = medias.sort(() => Math.random() - 0.5);
    }

    const media = randomMedias[idx];
    idx++;
    if (idx >= randomMedias.length) {
        idx = 0;
    }

    currentlyPlaying = media.substring(0, media.length - 4);
    return createAudioResource(join("./medias/", media));
}

player.on('error', error => {
	console.error(error);
});

player.play(getNextMedia());

player.on(AudioPlayerStatus.Playing, () => {
    console.log(`Now playing: ${getCurrentlyPlaying()}`);
});

player.on('debug', console.log);

player.on(AudioPlayerStatus.Idle, () => {
	player.play(getNextMedia());
});

export const subscribeToPlayer = (connection: VoiceConnection) => {
    connection.subscribe(player);
}
