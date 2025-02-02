import { EWSettingsDialog

 } from "./menus/SettingsMenu.mjs";
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
            strName : game.i18n.localize("EW.attribute.main.strength"),
            agiName : game.i18n.localize("EW.attribute.main.agility"),
            minName : game.i18n.localize("EW.attribute.main.mind"),
            appName : game.i18n.localize("EW.attribute.main.appeal"),
            melName : game.i18n.localize("EW.attribute.combat.melee"),
            ranName : game.i18n.localize("EW.attribute.combat.ranged"),
            defName : game.i18n.localize("EW.attribute.combat.defense"),
            iniName : game.i18n.localize("EW.attribute.combat.initiative"),
            lbdName : game.i18n.localize("EW.attribute.resource.lifeblood"),
            resName : game.i18n.localize("EW.attribute.resource.resolve"),
            critName : game.i18n.localize("EW.attribute.resource.critical"),
            faithName : game.i18n.localize("EW.attribute.resource.faith"),
            arcanaName : game.i18n.localize("EW.attribute.resource.arcana"),
            psionicsName : game.i18n.localize("EW.attribute.resource.psionics"),
            heroName : game.i18n.localize("EW.attribute.resource.hero")
        }
    })
    
}