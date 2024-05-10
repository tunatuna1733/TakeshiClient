import { request } from "../../axios";
import { CHAT_PREFIX } from "../data/chat";
import { KuudraItems } from "../data/kuudra_items";
import { sendDebugMessage } from "./debug";

const attributeItems = [];

let itemRetry = 0;
let allItems = [];
let auctions = [];

register('gameLoad', () => {
    updateItems();
    setTimeout(() => {
        allItems.forEach(i => {
            if ('can_have_attributes' in i && i['can_have_attributes'] === true) {
                attributeItems.push(i.name);
            }
        });
        updateAuctionFromApi();
    }, 5000);
});

register('gameUnload', () => {
    auctions = [];
});

register('step', () => {
    if (allItems.length !== 0) {
        updateAuctionFromApi();
    } else {
        updateItems();
    }
}).setDelay(2 * 60);

const updateItems = () => {
    ChatLib.chat('Fetching item data...');
    request({
        url: 'https://api.hypixel.net/v2/resources/skyblock/items',
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "Content-Type": "application/json"
        }
    }).then((res) => {
        if (res.data.success === false) {
            itemRetry++;
            ChatLib.chat(`${CHAT_PREFIX} &cFailed to fetch item data. Retrying...`);
            setTimeout(() => {
                updateItems();
            }, itemRetry * 1000);
        } else {
            allItems = res.data.items;
            sendDebugMessage('&aFetched item data.');
        }
    });
}

const updateAuctionFromApi = () => {
    request({
        url: 'https://skyblock-hono-production.up.railway.app/attributeitems',
        headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)",
            "Content-Type": "application/json"
        }
    }).then(r => {
        const response = r.data;
        if (response.success === true) {
            auctions = response.data;
        }
    });
}

const checkAttribute = (auction, attributeSearch) => {
    let hasAttribute = false;
    if (auction.attributes) {
        auction.attributes.forEach((auctionAttribute) => {
            if (auctionAttribute.id === attributeSearch.id &&
                auctionAttribute.value >= attributeSearch.value &&
                !hasAttribute
            )
                hasAttribute = true;
        });
    }
    return hasAttribute;
};

export const getAllItems = () => { return allItems };

export const getAllAuctions = () => { return auctions };

export const getPureItemName = (itemId) => {
    let itemName = '';
    allItems.forEach(item => {
        if (item.id === itemId) itemName = item.name;
    });
    return itemName;
}

/*
    armor
     type
      a1 with level
      a2 with level
     exact
      a1 with level
      a2 with level
      a1 and a2 without level

    equip
     exact
      a1 with level
      a2 with level
      a1 and a2 without level
*/

export const getPriceData = (itemId, isArmor, attributeSearchQuery) => {
    if (isArmor) {
        let typeResults = {}, exactMatchResults = {};
        let armorType = '';
        if (itemId.includes('HELMET')) armorType = 'HELMET';
        else if (itemId.includes('CHESTPLATE')) armorType = 'CHESTPLATE';
        else if (itemId.includes('LEGGINGS')) armorType = 'LEGGINGS';
        else if (itemId.includes('BOOTS')) armorType = 'BOOTS';
        attributeSearchQuery.forEach((as) => {
            typeResults[as.id] = auctions.filter(a => {
                return (
                    KuudraItems[armorType].includes(a.itemId) &&
                    checkAttribute(a, as)
                );
            });
            exactMatchResults[as.id] = auctions.filter(a => {
                return (
                    a.itemId === itemId &&
                    checkAttribute(a, as)
                );
            });
        });
        if (attributeSearchQuery.length === 2) {
            exactMatchResults['both'] = auctions.filter(a => {
                return (
                    a.itemId === itemId &&
                    checkAttribute(a, { id: attributeSearchQuery[0].id, value: 1 }) &&
                    checkAttribute(a, { id: attributeSearchQuery[1].id, value: 1 })
                );
            });
        }
        return [typeResults, exactMatchResults];
    } else {
        let exactMatchResults = {};
        attributeSearchQuery.forEach((as) => {
            exactMatchResults[as.id] = auctions.filter(a => {
                return (
                    a.itemId === itemId &&
                    checkAttribute(a, as)
                );
            });
        });
        if (attributeSearchQuery.length === 2) {
            exactMatchResults['both'] = auctions.filter(a => {
                return (
                    a.itemId === itemId &&
                    checkAttribute(a, { id: attributeSearchQuery[0].id, value: 1 }) &&
                    checkAttribute(a, { id: attributeSearchQuery[1].id, value: 1 })
                );
            });
        }
        return exactMatchResults;
    }
}