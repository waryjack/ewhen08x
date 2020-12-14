// Imports

import { preloadHandlebarsTemplates } from "./templates.js";
import { EW } from "./config.js";
import { EWActor } from "./actor/EWActor.js";
import { EWCombat } from "./combat/EWCombat.js";
// import { EWItem } from "./item/EWItem.js";
import EWActorSheet from "./sheets/actor/EWActorSheet.js";
import EWCareerSheet from "./sheets/item/EWCareerSheet.js";
import EWArmorSheet from "./sheets/item/EWArmorSheet.js";
import EWEquipmentSheet from "./sheets/item/EWEquipmentSheet.js";
import EWPowerSheet from "./sheets/item/EWPowerSheet.js";
import EWWeaponSheet from "./sheets/item/EWWeaponSheet.js";
import EWTraitSheet from "./sheets/item/EWTraitSheet.js";
import { registerSettings } from "./settings.js";
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
        EWTraitSheet,
        EWCombat,
        registerSettings
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


    //CONFIG.debug.hooks = true;
    CONFIG.Actor.entityClass = EWActor;
    CONFIG.Combat.entityClass = EWCombat;


    
    // Register system settings
    registerSettings();
    
    // Register partials templates
    preloadHandlebarsTemplates();

   
    // Register handlebar helpers

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

    Handlebars.registerHelper("proper", function(content) {
        let result = "";

        result = content[0].toUpperCase() + content.substring(1);

        return result;

    });
   
    Handlebars.registerHelper("buildVar", function(arg1, arg2, arg3) {
        let result=arg1+arg2+arg3;

        return new Handlebars.SafeString(result);
    });

    Handlebars.registerHelper("minus", function(arg1, arg2) {
        let result = arg1 - arg2;

        return result;
    });

    Handlebars.registerHelper("render", function(arg1){
        
        return new Handlebars.SafeString(arg1);
    });

    Handlebars.registerHelper("setting", function(arg){
        return game.settings.get('ewhen', arg); 
    });

    Handlebars.registerHelper("concat", function(...args){
        let result = "";
        for (let a of args) {
            result += a;
        }

        return result;
    });
});

Hooks.on('updateCombatant', function(combat, changed, diff) {
    console.log("Update Combatant Fired: ", combat);
    console.log("Update Combatant Changed: ", changed);
    console.log("UpdateCombatant Diff: ", diff);

    if(game.settings.get("ewhen", "initType") != "EWhenPriority") { return; }

    if (!("initiative" in changed)) { return; }

    let cmbInit = diff.initiative;

    let newInit = EWCombat.convertInitiative(changed);

    console.log("Inits before and after: ", cmbInit, newInit);

    changed.initiative = newInit;
});


Hooks.on('updateOwnedItem', function(actor, item){
    
    let type = item.type;
    let pmod = item.data.priority_dieMod;
    const adata = duplicate(actor.data.data.priority_roll);

  
    if(type=="trait" && pmod == "bonus") {
        adata.expression = "3d6kh2";
    } else if (type == "trait" && pmod == "penalty") {
        adata.expression = "3d6kl2";
    }

  

    actor.update({ "data.priority_roll": adata});

});

Hooks.on('deleteOwnedItem', function(actor, item){
    
    let type = item.type;
    let pmod = item.data.priority_dieMod;
    const adata = duplicate(actor.data.data.priority_roll);

    console.log("Adata (del): ", adata);

    if(type=="trait" && pmod != "none") {
        adata.expression = "2d6kh2";
    }
    
   
    actor.update({ "data.priority_roll": adata});

});



