// Imports

import { EW } from "./config.js";
import { EWActor } from "./actor/EWActor.js";
// import { EWItem } from "./item/EWItem.js";
import EWActorSheet from "./sheets/actor/EWActorSheet.js";
import EWCareerSheet from "./sheets/item/EWCareerSheet.js";
import EWArmorSheet from "./sheets/item/EWArmorSheet.js";
import EWEquipmentSheet from "./sheets/item/EWEquipmentSheet.js";
import EWPowerSheet from "./sheets/item/EWPowerSheet.js";
import EWWeaponSheet from "./sheets/item/EWWeaponSheet.js";
import EWTraitSheet from "./sheets/item/EWTraitSheet.js";
// import EWVehicleSheet from "./sheets/actor/EWVehicleSheet.js";



Hooks.once("init", () => {
    console.log("ewhen | Initializing Everywhen System");

    CONFIG.ewhen = EW;
   
    // Add namespace in global 
    
    game.EW = {
        EWActor,
        EWCareerSheet,
        EWActorSheet,
        EWArmorSheet,
        EWEquipmentSheet,
        EWPowerSheet,
        EWWeaponSheet,
        EWTraitSheet
    };

    
    // Unregister core sheets
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);

    // Register System sheets
    Actors.registerSheet("ewhen", EWActorSheet, { types:["character"], makeDefault:true });
    //  Actors.registerSheet("ewhen", EWVehicleSheet, { types: ["vehicle"], makeDefault:true });
    
    Items.registerSheet("ewhen", EWCareerSheet, { types: ["career"], makeDefault:true });
    Items.registerSheet("ewhen", EWArmorSheet, { types: ["armor"], makeDefault: true });
    Items.registerSheet("ewhen", EWTraitSheet, { types: ["trait"], makeDefault: true });
    Items.registerSheet("ewhen", EWEquipmentSheet, { types: ["equipment"], makeDefault: true });
    Items.registerSheet("ewhen", EWPowerSheet, { types: ["power"], makeDefault: true });
    Items.registerSheet("ewhen", EWWeaponSheet, { types: ["weapon"], makeDefault: true });


    CONFIG.debug.hooks = true;
    CONFIG.Actor.entityClass = EWActor;
    // CONFIG.Item.entityClass = EWItem;

    Handlebars.registerHelper('ife', function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("times", function(n, content) {
       let result = "";
       for (let i = 0; i < n; i++) {
           result += content.fn(i)
       }
       
       return result;

    });
   
});
