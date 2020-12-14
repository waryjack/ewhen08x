export const registerSettings = function() {
    
    // Register initiative model

    game.settings.register("ewhen", 'initType', {
        name: 'EW.SETTINGS.InitiativeMode',
        hint: 'EW.SETTINGS.InitiativeModeDesc',
        scope: 'world',
        config: true,
        type: String,
        default: 'EWhenPriority',
        choices: {
            'EWhenPriority': 'EW.SETTINGS.Priority',
            'EWhenTrad': 'EW.SETTINGS.EwhenConventional',
            'BoL': 'EW.SETTINGS.Barbarians'
            
        },
        onChange: (rule) => { 
            var expr;
            switch(rule){
                case "EWhenTrad": expr = "@priority_roll.expression+@main_attributes.mind.rank+@combat_attributes.initiative.rank"; break;
                case "BoL": expr = "1d6+@main_attributes.agility.rank"; break;
                case "EWhenPriority": expr="@priority_roll.expression+@main_attributes.mind.rank+@combat_attributes.initiative.rank"; break;
            }
            game.data.system.data.initiative = expr;
        }
    });

    game.settings.register("ewhen", "rerollPerRound", {
        name:"EW.SETTINGS.RerollPer",
        hint:"",
        config:true,
        type:Boolean,
        default:true
    });

    // Settings for various optional rules

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
    
}