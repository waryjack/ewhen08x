// Imports

import { EW } from "./config.js";
import EWActorSheet from "./sheets/actor/EWActorSheet.js";
import EWArmorSheet from "./sheets/item/EWArmorSheet.js";
import EWEquipmentSheet from "./sheets/item/EWEquipmentSheet.js";
import EWPowerSheet from "./sheets/item/EWPowerSheet.js";
import EWWeaponSheet from "./sheets/item/EWWeaponSheet.js";
import EWTraitSheet from "./sheets/item/EWTraitSheet.js";

Hooks.once("init", () => {
    console.log("ewhen | Initializing Everywhen System");

    CONFIG.ewhen = EW;

    // Add namespace in global 
    
    game.EW = {
        EWActorSheet,
        EWArmorSheet,
        EWEquipmentSheet,
        EWPowerSheet,
        EWWeaponSheet,
        EWTraitSheet
    };

    
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("ewhen", EWActorSheet, { makeDefault:true });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("ewhen", EWArmorSheet, { types: ["armor"], makeDefault: true });
    Items.registerSheet("ewhen", EWTraitSheet, { types: ["trait"], makeDefault: true });
    Items.registerSheet("ewhen", EWEquipmentSheet, { types: ["equipment"], makeDefault: true });
    Items.registerSheet("ewhen", EWPowerSheet, { types: ["power"], makeDefault: true });
    Items.registerSheet("ewhen", EWWeaponSheet, { types: ["weapon"], makeDefault: true });

    Handlebars.registerHelper('ife', function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
});
