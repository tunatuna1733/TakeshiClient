/// <reference types="../CTAutocomplete" />
/// <reference lib="es2022" />

import { checkForUpdate, getCurrentVersion, printChangelog, printHelp } from "./utils/update";
import { bestiaryData, customHudsData, data, gardenData, inventoryData, resetData } from "./utils/data";
import settings from "./settings";
import { setRegisters } from "./utils/register";
import hud_manager from "./utils/hud_manager";
const Toolkit = Java.type('java.awt.Toolkit');
const StringSelection = Java.type('java.awt.datatransfer.StringSelection');
const EssentialAPI = Java.type('gg.essential.api.EssentialAPI');
const EssentialNotifications = EssentialAPI.getNotifications();

import "./features/hud/armor";
import "./features/hud/equipment";
import "./features/hud/kuudra_armor_stack";
import "./features/hud/reforge";
import "./features/hud/ragnarock";
import "./features/hud/lifeline";
import "./features/hud/reaper";
import "./features/hud/last_breath";
import "./features/hud/inventory";
import "./features/hud/kicked_timer";
import "./features/hud/feeder";
import "./features/hud/tablist";
import "./features/hud/bonzo_and_phoenix";
import "./features/hud/ping";

import "./features/gui/attribute_lb";
import "./features/gui/auctions";
import "./features/gui/fishing_timer";
import "./features/gui/remember_inv";
import "./features/gui/bestiary_box";

import "./features/dungeon/terminal";
import "./features/dungeon/relic";
import "./features/dungeon/chest_glitch";
import "./features/dungeon/ice_spray";
import "./features/dungeon/broadcast_debuff";
import "./features/dungeon/chest_profit";

import "./features/kuudra/dropship";
import "./features/kuudra/kuudra_price";

import "./features/garden/composter";
import "./features/garden/pest_box";
import "./features/garden/spray";
import "./features/garden/pest_chunk";
import "./features/garden/pest_title";

import "./features/mining/powder";
import "./features/mining/glacite";

import "./features/misc/norevminion";

import "./utils/area";
import "./utils/bestiary_settings";
import "./utils/auction";
import "./utils/debug";

import { CHAT_PREFIX } from "./data/chat";
import { loadHuds } from "./features/hud/tablist";

data.autosave();
gardenData.autosave();
inventoryData.autosave();
bestiaryData.autosave();
customHudsData.autosave();

register('gameLoad', () => {
    if (!data.first) {
        ChatLib.command('tc resetloc', true);
        data.first = true;
        data.save();
        ChatLib.chat('&a-------------------------------------');
        ChatLib.chat('      &bWelcome to &dTakeshiClient!');
        ChatLib.chat('&a Run /tc to open settings');
        ChatLib.chat('&a-------------------------------------');
    }
    if (!data.helpPrinted) {
        ChatLib.command('tc help', true);
        data.helpPrinted = true;
        data.save();
    }
    const currentVersion = getCurrentVersion();
    if (currentVersion !== data.version) {
        data.version = currentVersion;
        data.save();
        printChangelog(currentVersion);
    }
});

register('guiClosed', (event) => {
    if (event.toString().includes("vigilance")) {
        setRegisters();
        loadHuds();
    }
});

register('gameUnload', () => {
    data.save();
    gardenData.save();
});

register('command', (args) => {
    if (!args) {
        settings.openGUI();
    } else if (args == 'movehud') {
        hud_manager.openGui();
    } else if (args == 'resetloc') {
        resetData();
    } else if (args == 'help') {
        printHelp();
    } else if (args == 'update') {
        checkForUpdate();
    }
}).setCommandName('tc', true).setAliases(['takeshiclient']);

register('command', () => {
    const lines = Scoreboard.getLines(false);
    lines.map((line) => {
        ChatLib.chat(`${line.getName().removeFormatting().replace(/[^\x00-\x7F]/g, "")}`);
    });
}).setCommandName('scc');

register('command', () => {
    let copied = false;
    const lines = Scoreboard.getLines(false);
    lines.map((line) => {
        if (line.getName().includes('Piggy') || line.getName().includes('Purse')) {
            const selection = new StringSelection(ChatLib.removeFormatting(line.getName()).replace(/[^\x00-\x7F]/g, ""));
            Toolkit.getDefaultToolkit().getSystemClipboard().setContents(selection, null);
            EssentialNotifications.push('Purse copied!', 'Copied your purse to your clipboard.', 3);
            copied = true;
        }
    });
    if (!copied) ChatLib.chat(`${CHAT_PREFIX} &cFailed to copy your purse :(`);
}).setCommandName('copypurse').setAliases(['cpp']);