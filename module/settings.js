export const registerSettings = function() {
    
    // Register initiative model
    // Doesn't do a damn thing yet, but eventually I'll get it set up
    // Until then, Combat Enhancements module is the way to go for drag/drop initiative!
    game.settings.register("ewhen", "ConventionalInit", {
        name: "EW.SETTINGS.ConventionalInit",
        hint: "EW.SETTINGS.ConventionalInitDesc",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: (rule) => (console.log("Toggled Initiative Rule"))
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
    
}