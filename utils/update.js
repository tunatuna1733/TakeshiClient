import { request } from '../../axios';
import { CHAT_PREFIX } from '../data/chat';

let latestVersion = '';

register('gameLoad', () => {
    checkForUpdate();
});

export const getCurrentVersion = () => {
    const metadata = FileLib.read('./config/ChatTriggers/modules/TakeshiClient/metadata.json');
    if (metadata === '') {
        console.log('[Takeshi] Failed to read metadata file.');
        return '0.0.0';
    }
    const metadataJson = JSON.parse(metadata);
    return metadataJson.version;
}

export const printHelp = () => {
    ChatLib.chat('&dTakeshiClient Help');
    ChatLib.chat('&7|  &eRun &c"/tc" &eto open settings.');
    ChatLib.chat('&7| &bCommands');
    ChatLib.chat('&7|  &c"/scc"&7: &aPrint your scoreboard to chat so that you can copy it.');
    ChatLib.chat('&7|  &c"/cpp"&7: &aCopy your purse text on your scoreboard.');
    ChatLib.chat('&7|  &c"/fst"&7: &aOpen fishing timer in external window.');
    ChatLib.chat('&7|  &c"/ri <name>"&7: &aSave the inventory.');
    ChatLib.chat('&7| &bKeybind');
    ChatLib.chat('&7|  &aYou can bind a key for opening kuudra item price gui.');
    ChatLib.chat('&7   &aYou can bind a key for sending party chat about estimated debuff result on dragons.');
}

export const printChangelog = (version) => {
    request({
        url: 'https://raw.githubusercontent.com/tunatuna1733/TakeshiClient/master/changelog.json'
    }).then((res) => {
        const response = res.data;
        const changelogs = response[version];
        if (!changelogs) {
            console.log(`[Takeshi] Failed to fetch changelog for version ${version}`);
            return;
        }
        ChatLib.chat(`&dTakeshiClient Changelog &av${version}`);
        changelogs.forEach((changelog) => {
            if (changelog.startsWith('# ')) {
                const title = changelog.replace('# ', '');
                ChatLib.chat(`&c&l${title}`);
            } else if (changelog.startsWith('- ')) {
                const change = changelog.replace('- ', '');
                ChatLib.chat(`  &e${change}`);
            }
        });
    }).catch((e) => {
        console.log(`[Takeshi] Failed to fetch changelog for version ${version}`);
        console.dir(e, { depth: null });
    })
};

export const checkForUpdate = () => {
    request({
        url: 'https://api.github.com/repos/tunatuna1733/TakeshiClient/releases/latest'
    }).then((res) => {
        const response = res.data;
        latestVersion = response.tag_name;
        if (isNewerVersion(latestVersion, getCurrentVersion())) {
            ChatLib.chat(`${CHAT_PREFIX} &bA new version of TakeshiClient (v${latestVersion}) is available!`);
            ChatLib.chat(`  &eDownload the newest release from GitHub or wait for the ChatTriggers to update automatically!`);
        } else {
            ChatLib.chat(`${CHAT_PREFIX} &bYou are running the latest version of TakeshiClient!`);
        }
    });
};

const isNewerVersion = (latest, current) => {
    const latestSplit = latest.split('.');
    const currentSplit = current.split('.');

    for (let i = 0; i < Math.min(latestSplit.length, currentSplit.length); i++) {
        if (parseInt(latestSplit[i]) > parseInt(currentSplit[i])) return true;
        else if (parseInt(latestSplit[i]) < parseInt(currentSplit[i])) return false;
    }

    return latestSplit.length > currentSplit.length;
};