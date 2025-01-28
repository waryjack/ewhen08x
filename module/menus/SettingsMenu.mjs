const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class EWSettingsDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "settings-menu",
        position:{
        },
        window:{
            title:"Everywhen Settings"
        },
        tag: "form",
        form: {
          handler: EWSettingsDialog.updateSettings,
          submitOnChange: false,
          closeOnSubmit: true
        },
        actions: {
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
        custname: {
            template:"systems/ewhen/templates/menus/custname.hbs"
        },
        footer: {
            template: "templates/generic/form-footer.hbs"
        }
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
        // console.log("context: ", context);
        context.buttons = [
            { type: "submit", icon: "fa-solid fa-save", label: "Save Changes (window will close)" },
            //{ type: "button", action: "restoreDefaults", icon: "fa-solid fa-undo", label: "Restore Defaults" },
        ]
        context.tabs = {
            general: {
                id: "general",
                group: "settings",
                icon: "fa-solid fa-gear",
                label: "EW.SETTINGS.MENU.genlabel",
                active: true,
                cssClass: this.tabGroups.settings === 'general' ? 'active' : '',
                data: context.current.general
            },
            initsettings: {
                id:"initsettings",
                group: "settings",
                icon:"fa-solid fa-stopwatch",
                label:"EW.SETTINGS.MENU.initlabel",
                active:false,
                cssClass: this.tabGroups.settings === 'initsettings' ? 'active' : '',
                data : context.current.init
            },
            trackers: {
                id:"trackers",
                group: "settings",
                icon:"fa-solid fa-chart-simple",
                label:"EW.SETTINGS.MENU.tracklabel",
                active:false,
                cssClass: this.tabGroups.settings === 'trackers' ? 'active' : '',
                data : context.current.trackers
            },
            custname: {
                id:"custname",
                group: "settings",
                icon:"fa-solid fa-pen-clip",
                label:"EW.SETTINGS.MENU.custname",
                active:false,
                cssClass: this.tabGroups.settings === 'custname' ? 'active' : '',
                data: context.current.custom
            }
        }

        context.initAttributes = {
            "0":"EW.game_term.none",
            "@main_attributes.strength.rank":"EW.attribute.main.strength",
            "@main_attributes.agility.rank":"EW.attribute.main.agility",
            "@main_attributes.mind.rank":"EW.attribute.main.mind",
            "@main_attributes.appeal.rank":"EW.attribute.main.appeal"
        }

        context.initCombat = {
            "0":"EW.game_term.none",
            "@combat_attributes.melee.rank":"EW.attribute.combat.melee",
            "@combat_attributes.ranged.rank":"EW.attribute.combat.ranged",
            "@combat_attributes.defense.rank":"EW.attribute.combat.defense",
            "@combat_attributes.initiative.rank":"EW.attribute.combat.defense"
        }
        
        context.linkAttributes = {
            "none":"EW.game_term.none",
            "strength":"EW.attribute.main.strength",
            "agility":"EW.attribute.main.agility",
            "mind":"EW.attribute.main.mind",
            "appeal":"EW.attribute.main.appeal"
        }

        context.yesno = {
            "true":"EW.general_term.yes",
            "false":"EW.general_term.no"
        }

        context.dicetype = {
            '2d6': 'EW.SETTINGS.2d6',
            '2d10': 'EW.SETTINGS.2d10',
            '2d12': 'EW.SETTINGS.2d12',
            '3d6': 'EW.SETTINGS.3d6'
        }
        console.log("Menu context: ", context);
        return context;

    }

    async _preparePartContext(id, context) {
       // console.log("Part ID / Context: ", id, "\n", context);
        let cs = this._getCurrentSettings();
        switch (id) {
            case "general":context.tab = context.tabs[id];break;
            case "initsettings":context.tab = context.tabs[id];break;
            case "trackers":context.tab = context.tabs[id];break;
            case "custname":  context.tab = context.tabs[id];break;
            default: break;

        }
        // console.log("Part context: ", context);
        return context;
    }

    static updateSettings(event, form, formData) {
        //assemble the stuff from the form
        console.log("this ", this);

        // yesnos: priority, useArcana, useCredit, useCritical, useFaith, usePsionics, useResolve, singleDieInit
        let converts = ['priority', 'useArcana', 'useCredit', 'useCritical', 'usePsionics','useFaith','useResolve', 'singleDieInit','rerollPerRound','useScale'];
        let newSettings = formData.object;

        converts.forEach(i => {
            newSettings[i] = newSettings[i] === "true";
        })

        console.log("New Settings object: ", newSettings)
        game.settings.set("ewhen", "allSettings", newSettings);
        
    }

    static restoreDefaults(event, target) {
        console.log("clicked restore: ");
        console.log("this ", this)
        console.log("target: ", target)
       // console.log("get defaults: ", this._getDefaultSettings());
        

       EWSettingsDialog.updateSettings(null, null, this._getDefaultSettings())
       this._rerenderMe();
       // game.settings.set("ewhen", "allSettings", this._getDefaultSettings());
       
    }

    _rerenderMe(){
        this.render(true);
    }

    // retrieve current values of settings
    _getCurrentSettings(){
        return game.settings.get("ewhen", "allSettings");
    }

    _getDefaultSettings(){
        let defaultSettings = {
            object: {
                diceType : "2d6",
                singleDieInit : "false",
                initAttribute : "@main_attributes.strength.rank",
                initCombat : "@combat_attributes.initiative.rank",
                priority : "true",
                rerollPerRound : "false",
                meleeLink : "agility",
                rangedLink : "agility",
                defenseLink : "agility",
                useResolve : "false",
                useCritical : "false",
                useArcana : "false",
                useFaith : "false",
                usePsionics : "false",
                useScale : "true",
                useCredit : "false",
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
        }
        return defaultSettings;
    }

  



}