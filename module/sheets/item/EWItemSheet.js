export default class EWItemSheet extends ItemSheet {

    // Note: Careers have basically just a name and an optional description; but the sheet is needed for item creation;
    
    get template() {
        const path = 'systems/ewhen/templates/item/';
        return `${path}${this.item.type}sheet.hbs`;
    }

    async getData () {
        const data = this.item.system;
        data.item = this.item;
        data.myName = data.name;
        data.config = CONFIG.ewhen; 

        data.attOpts = {
            "none":game.i18n.localize("EW.game_term.none"),
            "strength":game.settings.get("ewhen","strName"),
            "agility":game.settings.get("ewhen", "agiName"),
            "mind":game.settings.get("ewhen", "minName"),
            "appeal":game.settings.get("ewhen", "appName")
        }

        data.wtypeOpts = {
            "lightMelee":game.i18n.localize("EW.weapontype.lightmelee"),
            "mediumMelee":game.i18n.localize("EW.weapontype.mediummelee"),
            "heavyMelee":game.i18n.localize("EW.weapontype.heavymelee"),
            "lightRanged":game.i18n.localize("EW.weapontype.lightranged"),
            "mediumRanged":game.i18n.localize("EW.weapontype.mediumranged"),
            "heavyRanged":game.i18n.localize("EW.weapontype.heavyranged"),
        }
        data.whandOpts = {
            "one":game.i18n.localize("EW.weaponhands.onehanded"),
            "two":game.i18n.localize("EW.weaponhands.twohanded")
        }
        data.atypeOpts = {
            "light":game.i18n.localize("EW.armortype.light"),
            "medium":game.i18n.localize("EW.armortype.medium"),
            "heavy":game.i18n.localize("EW.armortype.heavy"),
            "complete":game.i18n.localize("EW.armortype.complete"),
            "helmet":game.i18n.localize("EW.armortype.helmet"),
            "small_shield":game.i18n.localize("EW.armortype.small_shield"),
            "large_shield":game.i18n.localize("EW.armortype.large_shield")
        }

        data.abonusOpts = {
            "none":game.i18n.localize("EW.game_term.none"),
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
           "none":game.i18n.localize("EW.game_term.none"),
            "1d3":"d3",
            "1d6-3":"d6-3",
            "1d6-2":"d6-2",
            "1d6-1":"d6-1",
            "1d6":"d6"
        }

        data.eraOpts = {

            "ancient":game.i18n.localize("EW.era.ancient"),
            "steampunk":game.i18n.localize("EW.era.steampunk"),
            "modern":game.i18n.localize("EW.era.modern"),
            "cyberpunk":game.i18n.localize("EW.era.cyberpunk"),
            "future":game.i18n.localize("EW.era.future"),
            "other":game.i18n.localize("EW.era.other")


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
            "boon":game.i18n.localize("EW.trait.type.boon"),
            "flaw":game.i18n.localize("EW.trait.type.flaw"),
            "power":game.i18n.localize("EW.trait.type.power")
        }
        data.traitSourceOpts = {
            "normal":game.i18n.localize("EW.trait.source.normal"),
            "origin":game.i18n.localize("EW.trait.source.origin"),
            "augment":game.i18n.localize("EW.trait.source.augment"),
            "supernatural":game.i18n.localize("EW.trait.source.supernatural"),
            "vehicle":game.i18n.localize("EW.trait.source.vehicle"),
            "setting":game.i18n.localize("EW.trait.source.setting"),
            "creature":game.i18n.localize("EW.trait.source.creature"),
            "martial_arts":game.i18n.localize("EW.trait.source.martial_arts"),
            "custom":game.i18n.localize("EW.trait.source.custom")
        }

        data.traitPriModOpts = {
            "none":game.i18n.localize("EW.game_term.none"),
            "bonus":game.i18n.localize("EW.game_term.bonusdie"),
            "penalty":game.i18n.localize("EW.game_term.penaltydie")
        }

        data.enrichedDescription = await TextEditor.enrichHTML(data.description);
        
        console.log("Item Data: ", data);
        
        return data;
    }

}