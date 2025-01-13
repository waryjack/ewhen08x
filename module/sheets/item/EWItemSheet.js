export default class EWItemSheet extends ItemSheet {

    // Note: Careers have basically just a name and an optional description; but the sheet is needed for item creation;
    
    get template() {
        const path = 'systems/ewhen/templates/item/';
        return `${path}${this.item.type}sheet.hbs`;
    }

    getData () {
        const data = this.item.system;
        data.item = this.item;
        data.myName = data.name;
        data.config = CONFIG.ewhen; 

        data.attOpts = {
            "none":"none",
            "strength":game.settings.get("ewhen","strName"),
            "agility":game.settings.get("ewhen", "agiName"),
            "mind":game.settings.get("ewhen", "minName"),
            "appeal":game.settings.get("ewhen", "appName")
        }

        data.wtypeOpts = {
            "lightMelee":"Light Melee",
            "mediumMelee":"Medium Melee",
            "heavyMelee":"Heavy Melee",
            "lightRanged":"Light Ranged",
            "mediumRanged":"Medium Ranged",
            "heavyRanged":"Heavy Ranged"
        }
        data.whandOpts = {
            "one":"One-hand",
            "two":"Two-handed"
        }
        data.atypeOpts = {
            "light":"Light",
            "medium":"Medium",
            "heavy":"Heavy",
            "complete":"Complete",
            "helmet":"Helmet",
            "small_shield":"Small Shield",
            "large_shield":"Large Shield"
        }

        data.abonusOpts = {
            "none":game.i18n.localize("None"),
            "strength":game.settings.get("ewhen","strName"),
            "agility":game.settings.get("ewhen", "agiName"),
            "mind":game.settings.get("ewhen", "minName"),
            "appeal":game.settings.get("ewhen", "appName"),
            "melee":game.settings.get("ewhen","melName"),
            "ranged":game.settings.get("ewhen","ranName"),
            "defense":game.settings.get("ewhen", "defName"),
            "initiative":game.settings.get("ewhen","iniName")
        }

        data.vprotectOpts = {
           "none":game.i18n.localize("None"),
            "1d3":"d3",
            "1d6-3":"d6-3",
            "1d6-2":"d6-2",
            "1d6-1":"d6-1",
            "1d6":"d6"
        }

        data.eraOpts = {

            "ancient":"Ancient",
            "steampunk":"Steampunk",
            "modern":"Modern",
            "cyberpunk":"Cyberpunk",
            "future":"Future",
            "other":"Other"


        }
        data.dmgDiceOpts = {
            "0":"0",
            "1":"1",
            "1d2":"d2",
            "1d3":"d3",
            "1d3+1":"d3+1",
            "1d6-1":"d6-1",
            "1d6":"d6",
            "1d6+1":"d6+1",
            "1d6+2":"d6+2",
            "1d6+3":"d6+3",
            "2d6kl1":"d6L",
            "2d6kh1":"d6H",
            "3d6kl2":"2d6L",
            "2d6":"2d6",
            "3d6kh2":"2d6H",
            "4d6kl3":"3d6L",
            "3d6":"3d6",
            "4d6kh3":"3d6H"
        }
        data.traitTypeOpts = {
            "boon":"Boon",
            "flaw":"Flaw",
            "power":"Power"
        }
        data.traitSourceOpts = {
            "normal":'Normal',
            "origin":'Origin',
            "augment":"Augment",
            "supernatural":"Supernatural",
            "vehicle":"Vehicle",
            "setting":"Setting",
            "creature":"Creature",
            "martial_arts":"Martial Arts",
            "custom":"Custom"
        }

        data.traitPriModOpts = {
            "none":game.i18n.localize("None"),
            "bonus":"Bonus Die",
            "penalty":"Penalty Die"
        }

        data.enrichedDescription = TextEditor.enrichHTML(data.description, {async: false});
        
        console.log("Item Data: ", data);
        
        return data;
    }
}