export const registerSettings = function() {
    
    // Register initiative model
    // Doesn't do a damn thing yet, but eventually I'll get it set up
    // Until then, Combat Enhancements module is the way to go for drag/drop initiative!
    game.settings.register("ewhen", "ConventionalInit", {
        name: "SETTINGS.ConventionalInit",
        hint: "SETTINGS.ConventionalInitDesc",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: (rule) => (console.log("Toggled Initiative Rule"))
    });

    
}