const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class EWSettingsDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "settings-menu",
        position:{},
        window:{
            title:"Everywhen Settings"
        },
        tag: "form",
        form: {
          handler: EWSettingsDialog.updateSettings,
          submitOnChange: false,
          closeOnSubmit: false
        },
        action: {
            updateSettings : EWSettingsDialog.updateSettings,
            restoreDefaults: EWSettingsDialog.restoreDefaults
        }

      }

    static PARTS = {
        header: {
            template: "systems/ewhen/templates/menus/header.hbs"
        }, 
        tabs:{
           template: "systems/ewhen/templates/menus/tabs.hbs"
        },
        general: {
            template: "systems/ewhen/templates/menus/general.hbs"
        },
        initsettings: {
            template:"systems/ewhen/templates/menus/initsettings.hbs"
        },
        trackers: {
            template:"systems/ewhen/templates/menus/trackers.hbs"
        },
        /*renames: {
            templates:"systems/ewhen/templates/menus/renames.hbs"
        },*/
    }

   

    static updateSettings(data) {
        //assemble the stuff from the form

        this._processSettingChanges(updates);
    }

    async _prepareContext(context){
        context.config = CONFIG.ewhen;
        context.current = this._getCurrentSettings();

        // prepare tab object
        /**
         * @typedef ApplicationTab
         * @property {string} id         The ID of the tab. Unique per group.
         * @property {string} group      The group this tab belongs to.
         * @property {string} icon       An icon to prepend to the tab
         * @property {string} label      Display text, will be run through `game.i18n.localize`
         * @property {boolean} active    If this is the active tab, set with `this.tabGroups[group] === id`
         * @property {string} cssClass   "active" or "" based on the above boolean
         */

        if (!this.tabGroups.settings) this.tabGroups.settings = 'general';

        context.tabs = {
            initsettings: {
                id:"initsettings",
                group: "settings",
                icon:"",
                label:"EW.SETTINGS.MENU.initlabel",
                active:false,
                cssClass: this.tabGroups.settings === 'initsettings' ? 'active' : '',
                data : context.current.init
            },
            trackers: {
                id:"trackers",
                group: "settings",
                icon:"",
                label:"EW.SETTINGS.MENU.tracklabel",
                active:false,
                cssClass: this.tabGroups.settings === 'trackers' ? 'active' : '',
                data : context.current.trackers
            },
            renames: {
                id:"renames",
                group: "settings",
                icon:"",
                label:"EW.SETTINGS.MENU.initlabel",
                active:false,
                cssClass: this.tabGroups.settings === 'renames' ? 'active' : '',
                data: context.current.custom
            },
            general: {
                id: "general",
                group: "settings",
                icon: "",
                label: "EW.SETTINGS.MENU.genlabel",
                active: true,
                cssClass: this.tabGroups.settings === 'general' ? 'active' : '',
                data: context.current.general
            }
        }

        

        console.log("Menu context: ", context);
        return context;

    }

    async _preparePartContext(id, context) {
        let cs = this._getCurrentSettings();
        switch (id) {
            case "general":context.tab = context.tabs[id];break;
            case "initsettings":context.tab = context.tabs[id];break;
            case "trackers":context.tab = context.tabs[id];break;
            case "renames":  context.tab = context.tabs[id];break;
            default: break;

        }
        console.log("Part context: ", context);
        return context;
    }

    // retrieve current values of settings
    _getCurrentSettings(){
        let current = {};
        let currentGeneral = {
            // general settings
            diceType : game.settings.get("ewhen", "diceType"),
            useScale : game.settings.get("ewhen", "useScale"),
            useCredit : game.settings.get("ewhen", "useCredit"),
            meleeLink : game.settings.get("ewhen", "meleeLink"),
            rangedLink : game.settings.get("ewhen", "rangedLink"),
            defenseLink : game.settings.get("ewhen", "defenseLink"),
            rabbleStrength : game.settings.get("ewhen", "rabbleStrength")
        }

        let currentInit = {
            // initiative
            singleDieInit : game.settings.get("ewhen", "singleDieInit"),
            initAttribute : game.settings.get("ewhen", "initAttribute"),
            initCombat : game.settings.get("ewhen", "initCombat"),
            priority : game.settings.get("ewhen", "priority"),
            rerollPerRound : game.settings.get("ewhen", "rerollPerRound")
        }

        let currentTrackers = {
            //trackers
            useResolve : game.settings.get("ewhen", "useResolve"),
            useCritical : game.settings.get("ewhen", "useCritical"),
            useArcana : game.settings.get("ewhen", "useArcana"),
            useFaith : game.settings.get("ewhen", "useFaith"),
            usePsionics : game.settings.get("ewhen", "usePsionics")
        }

        let currentCustomNames = {    //custom names
            strName : game.settings.get("ewhen", "strName"),
            agiName : game.settings.get("ewhen", "agiName"),
            minName : game.settings.get("ewhen", "minName"),
            appName : game.settings.get("ewhen", "appName"),
            melName : game.settings.get("ewhen", "melName"),
            ranName : game.settings.get("ewhen", "ranName"),
            defName : game.settings.get("ewhen", "defName"),
            iniName : game.settings.get("ewhen", "iniName")
            /* lbdName : game.settings.get("ewhen", "lbdName"),
            resName : game.settings.get("ewhen", "resName"),
            critName : game.settings.get("ewhen", "critName"),
            faithName : game.settings.get("ewhen", "faithName"),
            arcanaName : game.settings.get("ewhen", "arcanaName"),
            psionicsName : game.settings.get("ewhen", "psionicsName"),
            heroName : game.settings.get("ewhen", "heroName")*/
        }
        current.general = currentGeneral;
        current.init = currentInit;
        current.trackers = currentTrackers;
        current.custom = currentCustomNames;

        return current;
    }

    _processSettingChanges(data) {
        
    }

    static restoreDefaults() {
        let defaults = {
            diceType : "2d6",
            singleDieInit : false,
            initAttribute : "@main_attributes.mind.rank",
            initCombat : "@main_attributes.initiative.rank",
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
            melName : game.i18n.localize("EW.attribute.main.melee"),
            ranName : game.i18n.localize("EW.attribute.main.ranged"),
            defName : game.i18n.localize("EW.attribute.main.defense"),
            iniName : game.i18n.localize("EW.attribute.main.initiative")
            /* lbdName : game.i18n.localize("EW.attribute.resource.lifeblood"),
            resName : game.i18n.localize("EW.attribute.resource.resolve"),
            critName : game.i18n.localize("EW.attribute.resource.critical"),
            faithName : game.i18n.localize("EW.attribute.resource.faith_points"),
            arcanaName : game.i18n.localize("EW.attribute.resource.arcana_points"),
            psionicsName : game.i18n.localize("EW.attribute.resource.psionic_points"),
            heroName : game.i18n.localize("EW.attribute.resource.hero_points")*/
        }

        this._processSettingChanges(defaults);
    }



}