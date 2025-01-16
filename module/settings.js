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

    game.settings.register("ewhen", 'diceType', {
        name: 'EW.SETTINGS.DiceType',
        hint: 'EW.SETTINGS.DiceTypeDesc',
        scope: 'world',
        config: true,
        type: String,
        default: '2d6',
        choices: {
            '2d6': 'EW.SETTINGS.2d6',
            '2d10': 'EW.SETTINGS.2d10',
            '2d12': 'EW.SETTINGS.2d12',
            '3d6': 'EW.SETTINGS.3d6',
        },
        onChange: (rule) => {
            console.log(rule);
            // game.data.system.baseRoll = rule;
        }
    });

    game.settings.register("ewhen", 'singleDieInit', {
        name: 'EW.SETTINGS.SingleDieInit',
        hint: 'EW.SETTINGS.SingleDieInitDesc',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
    });

    game.settings.register("ewhen", "initAttribute", {
        name:"EW.SETTINGS.InitAttribute",
        hint:"EW.SETTINGS.InitAttributeDesc",
        config:true,
        type:String,
        default:"0",
        choices: {
            '0':'None',
            '@main_attributes.strength.rank':'EW.attribute.main.strength',
            '@main_attributes.agility.rank':'EW.attribute.main.agility',
            '@main_attributes.mind.rank':'EW.attribute.main.mind',
            '@main_attributes.appeal.rank':'EW.attribute.main.appeal'
        },
        onChange: () => {
            game.system.initiative = `@priority_roll.expression + ${game.settings.get('ewhen', 'initAttribute')} + ${game.settings.get('ewhen', 'initCombat')}`
        }
    });
    
    game.settings.register("ewhen", "initCombat", {
        name:"EW.SETTINGS.InitCombat",
        hint:"EW.SETTINGS.InitCombatDesc",
        config:true,
        type:String,
        default:"0",
        choices: {
            '0':'None',
            '@combat_attributes.melee.rank':'EW.attribute.combat.melee',
            '@combat_attributes.ranged.rank':'EW.attribute.combat.ranged',
            '@combat_attributes.defense.rank':'EW.attribute.combat.defense',
            '@combat_attributes.initiative.rank':'EW.attribute.combat.initiative'
        },
        onChange: () => {
            game.system.initiative = `@priority_roll.expression + ${game.settings.get('ewhen', 'initAttribute')} + ${game.settings.get('ewhen', 'initCombat')}`
        }
    });

    game.settings.register("ewhen", "priority", {
        name: "EW.SETTINGS.PriorityToggle",
        hint: "",
        config:true,
        type:Boolean,
        default:true
    });

    game.settings.register("ewhen", "rerollPerRound", {
        name:"EW.SETTINGS.RerollPer",
        hint:"",
        config:true,
        type:Boolean,
        default:true
    });


    
    // Settings for various optional rules

    game.settings.register("ewhen", "meleeLink", {
        name: "EW.SETTINGS.meleeLink",
        hint: "EW.SETTINGS.meleeLinkDesc",
        scope:"world",
        config:true,
        type:String,
        default:"agility",
        choices: {
            "none":"None",
            "strength":"Strength",
            "agility":"Agility",
            "mind":"Mind",
            "appeal":"Appeal"
        }
    });

    game.settings.register("ewhen", "rangedLink", {
        name: "EW.SETTINGS.rangedLink",
        hint: "EW.SETTINGS.rangedLinkDesc",
        scope:"world",
        config:true,
        type:String,
        default:"agility",
        choices: {
            "none":"None",
            "strength":"Strength",
            "agility":"Agility",
            "mind":"Mind",
            "appeal":"Appeal"
        }
    });

    game.settings.register("ewhen", "defenseLink", {
        name: "EW.SETTINGS.defenseLink",
        hint: "EW.SETTINGS.defenseLinkDesc",
        scope:"world",
        config:true,
        type:String,
        default:"agility",
        choices: {
            "none":"None",
            "strength":"Strength",
            "agility":"Agility",
            "mind":"Mind",
            "appeal":"Appeal"
        }
    });

    game.settings.register("ewhen", "initLink", {
        name: "EW.SETTINGS.initLink",
        hint: "EW.SETTINGS.initLinkDesc",
        scope:"world",
        config:false,
        type:String,
        default:"agility",
        choices: {
            "none":"None",
            "strength":"Strength",
            "agility":"Agility",
            "mind":"Mind",
            "appeal":"Appeal"
        }
    });

    game.settings.register("ewhen", "useResolve", {
        name: "EW.SETTINGS.UseResolve",
        hint: "EW.SETTINGS.UseResolveDesc",
        scope:"world",
        config:true,
        type:Boolean,
        default:true
    });

    game.settings.register("ewhen", "useCritical", {
        name: "EW.SETTINGS.UseCritical",
        hint: "EW.SETTINGS.UseCritical",
        scope:"world",
        config:true,
        type:Boolean,
        default:true
    });

    game.settings.register("ewhen", "useArcana", {
        name: "EW.SETTINGS.UseArcana",
        hint: "EW.SETTINGS.UseArcanaDesc",
        scope:"world",
        config:true,
        type:Boolean,
        default:true
    });

    game.settings.register("ewhen", "useFaith", {
        name: "EW.SETTINGS.UseFaith",
        hint: "EW.SETTINGS.UseFaithDesc",
        scope:"world",
        config:true,
        type:Boolean,
        default:true
    });

    game.settings.register("ewhen", "usePsionics", {
        name: "EW.SETTINGS.UsePsionics",
        hint: "EW.SETTINGS.UsePsionicsDesc",
        scope:"world",
        config:true,
        type:Boolean,
        default:true
    });

    game.settings.register("ewhen", "useScale", {
        name: "EW.SETTINGS.UseScale",
        hint: "EW.SETTINGS.UseScaleDesc",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register("ewhen", "useCredit", {
        name: "EW.SETTINGS.UseCredit",
        hint: "EW.SETTINGS.UseCreditDesc",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register("ewhen", "rabbleStrength", {
        name: "EW.SETTINGS.rabbleStrength",
        hint: "EW.SETTINGS.rabbleStrengthDesc",
        scope: "world",
        config: true,
        type: Number,
        default:1
    });

    game.settings.register("ewhen", "strName", {
        name: "EW.SETTINGS.strName",
        hint: "EW.SETTINGS.strNameDesc",
        scope: "world",
        config: true,
        type: String,
        default: "Strength"
    });


    game.settings.register("ewhen", "agiName", {
        name: "EW.SETTINGS.agiName",
        hint: "EW.SETTINGS.agiNameDesc",
        scope: "world",
        config: true,
        type: String,
        default: "Agility"
    });

    game.settings.register("ewhen", "minName", {
        name: "EW.SETTINGS.minName",
        hint: "EW.SETTINGS.minNameDesc",
        scope: "world",
        config: true,
        type: String,
        default: "Mind"
    });

    game.settings.register("ewhen", "appName", {
        name: "EW.SETTINGS.appName",
        hint: "EW.SETTINGS.appNameDesc",
        scope: "world",
        config: true,
        type: String,
        default: "Appeal"
    });

    game.settings.register("ewhen", "melName", {
        name: "EW.SETTINGS.melName",
        hint: "EW.SETTINGS.melNameDesc",
        scope: "world",
        config: true,
        type: String,
        default: "Melee"
    });

    game.settings.register("ewhen", "ranName", {
        name: "EW.SETTINGS.ranName",
        hint: "EW.SETTINGS.ranNameDesc",
        scope: "world",
        config: true,
        type: String,
        default: "Ranged"
    });

    game.settings.register("ewhen", "defName", {
        name: "EW.SETTINGS.defName",
        hint: "EW.SETTINGS.defNameDesc",
        scope: "world",
        config: true,
        type: String,
        default: "Defense"
    });

    game.settings.register("ewhen", "iniName", {
        name: "EW.SETTINGS.iniName",
        hint: "EW.SETTINGS.iniNameDesc",
        scope: "world",
        config: true,
        type: String,
        default: "Initiative"
    });
}