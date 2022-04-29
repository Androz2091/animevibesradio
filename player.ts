import { AudioPlayerStatus, createAudioPlayer, createAudioResource, NoSubscriberBehavior, VoiceConnection } from "@discordjs/voice";
import { readdirSync } from "fs";

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

    currentlyPlaying = media;
    return createAudioResource(media);
}

player.on('error', error => {
	console.error(error);
});

player.play(getNextMedia());

player.on(AudioPlayerStatus.Idle, () => {
	player.play(getNextMedia());
});

export const subscribeToPlayer = (connection: VoiceConnection) => {
    connection.subscribe(player);
}
