import { getLb, getSpray } from "../../utils/dungeon";

const debuffKey = new KeyBind('Broadcast estimated debuff results', Keyboard.KEY_NONE, 'TakeshiClient');

register('renderWorld', () => {
    if (debuffKey.isPressed()) {
        ChatLib.command(`pc LB:${getLb()}, IceSpray: ${getSpray()}`);
    }
});