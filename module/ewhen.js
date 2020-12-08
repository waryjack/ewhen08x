// Imports

import { EW } from "./config.js";
import { EWActorSheet } from "./sheets/actor/EWActorSheet.js";
import { EWItemSheet } from "./sheets/item/EWItemSheet.js";

Hooks.once("init", () => {
    console.log("ewhen | Initializing Everywhen System");

    CONFIG.ewhen = EW;

    // Add namespace in global 
    
    game.EW = {
        EWActorSheet,
        EWItemSheet
    };

    
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("ewhen", EWActorSheet, { makeDefault:true });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("ewhen", EWItemSheet, { makeDefault: true });
});
