import { EWSettingsDialog } from "./menus/SettingsMenu.mjs";
export const registerSettings = function() {

    // Register initiative model
    /* game.settings.register("ewhen", 'initType', {
        name: 'EW.SETTINGS.InitiativeMode',
        hint: 'EW.SETTINGS.InitiativeModeDesc',
        scope: 'world',
        config: true,
        type: String,
        default: 'EWhenPriority',
        choices: {
            'EWhenPriority': 'EW.SETTINGS.Priority',
            'EWhenTrad': 'EW.SETTINGS.EwhenConventional',
            'BoL': 'EW.SETTINGS.Barbarians',
            'H+I': 'EW.SETTINGS.HonorIntrigue'

        },
        onChange: (rule) => {
            var expr;
            switch(rule){
                case "EWhenTrad": expr = "@priority_roll.expression+@main_attributes.mind.rank+@combat_attributes.initiative.rank"; break;
                case "BoL": expr = "1d6+@main_attributes.agility.rank"; break;
                case "EWhenPriority": expr="@priority_roll.expression+@main_attributes.mind.rank+@combat_attributes.initiative.rank"; break;
                case "H+I": expr="1d6+@main_attributes.mind.rank"; break;
            }
            game.data.system.data.initiative = expr;
        }
    }); */

    game.settings.registerMenu("ewhen", "ewhenSettingsMenu", {
        name: "EW.SETTINGS.MENU.menuname",
        label: "EW.SETTINGS.MENU.menulabel",
        hint: "EW.SETTINGS.MENU.menuhint",
        icon: "fas fa-bars",
        type: EWSettingsDialog,
        restricted:true
    });
    
    game.settings.register("ewhen","allSettings",{
        scope:"world",
        config:false,
        type: Object,
        default: {
            diceType : "2d6",
            singleDieInit : false,
            initAttribute : "@main_attributes.strength.rank",
            initCombat : "@combat_attributes.initiative.rank",
            priority : true,
            rerollPerRound : false,
            meleeLink : "agility",
            rangedLink : "agility",
            defenseLink : "agility",
            useResolve : false,
            useCritical : true,
            useArcana : false,
            useFaith : false,
            usePsionics : false,
            useScale : true,
            useCredit : false,
            rabbleStrength : 1,
            strName : "strength", // game.i18n.localize("EW.attribute.main.strength"),
            agiName : "agility", // game.i18n.localize("EW.attribute.main.agility"),
            minName : "mind", // game.i18n.localize("EW.attribute.main.mind"),
            appName : "appeal", // game.i18n.localize("EW.attribute.main.appeal"),
            melName : "melee", // game.i18n.localize("EW.attribute.combat.melee"),
            ranName : "ranged", // game.i18n.localize("EW.attribute.combat.ranged"),
            defName : "defense", // game.i18n.localize("EW.attribute.combat.defense"),
            iniName : "initiative", // game.i18n.localize("EW.attribute.combat.initiative"),
            lbdName : "lifeblood", // game.i18n.localize("EW.attribute.resource.lifeblood"),
            resName : "resolve", // game.i18n.localize("EW.attribute.resource.resolve"),
            critName : "critical", // game.i18n.localize("EW.attribute.resource.critical"),
            faithName : "faith", // game.i18n.localize("EW.attribute.resource.faith"),
            arcanaName : "arcana", // game.i18n.localize("EW.attribute.resource.arcana"),
            psionicsName : "psionics", // game.i18n.localize("EW.attribute.resource.psionics"),
            heroName : "hero", // game.i18n.localize("EW.attribute.resource.hero"),
            creditName: "credit",
            currencyName: "currency"
        }
    })
    
}