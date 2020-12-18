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
import EWVehicleSheet from "./sheets/actor/EWVehicleSheet.js";



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
    Actors.registerSheet("ewhen", EWVehicleSheet, { types: ["vehicle"], makeDefault:true });
    
    Items.registerSheet("ewhen", EWCareerSheet, { types: ["career"], makeDefault:true });
    Items.registerSheet("ewhen", EWArmorSheet, { types: ["armor"], makeDefault: true });
    Items.registerSheet("ewhen", EWTraitSheet, { types: ["trait"], makeDefault: true });
    Items.registerSheet("ewhen", EWEquipmentSheet, { types: ["equipment"], makeDefault: true });
    Items.registerSheet("ewhen", EWPowerSheet, { types: ["power"], makeDefault: true });
    Items.registerSheet("ewhen", EWWeaponSheet, { types: ["weapon"], makeDefault: true });


    // CONFIG.debug.hooks = true;
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
       if (n==0 || n == null) return;
       for (let i = 0; i < n; i++) {
           result += content.fn(i)
       }
       
       return result;

    });

    //uppercases; needs work
    Handlebars.registerHelper("proper", function(content) {
        let result = "";

        result = content[0].toUpperCase() + content.substring(1);

        return result;

    });

    Handlebars.registerHelper("minus", function(arg1, arg2) {
        let result = arg1 - arg2;

        return result;
    });

    Handlebars.registerHelper("render", function(arg1){
        
        return new Handlebars.SafeString(arg1);
    });

    // Checks whether a game setting is active
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

    Handlebars.registerHelper("and", function(a, b){
        return (a && b); 
    });

    Handlebars.registerHelper("or", function(a, b){
        return (a || b);
    });
});

/**
 * Item Hooks - update, delete, make sure to adjust stats 
 * for armor and so forth, initiative.
 * 
 * Todo - consolidate and move to method(s) in EWActor?
 */

Hooks.on('updateOwnedItem', function(actor, item, changed){

    console.log("Changed: ", changed);
    console.log("Change contains equipped: ", ("equipped" in changed.data));
    const ma = ["strength", "agility", "mind", "appeal"];
    const ca = ["melee", "ranged", "defense", "initiative"];

    if(item.type == "trait") {
    
        let type = item.type;
        let pmod = item.data.priority_dieMod;
        const adata = duplicate(actor.data.data.priority_roll);

    
        if(pmod == "bonus") {
            adata.expression = "3d6kh2";
        } else if (type == "trait" && pmod == "penalty") {
            adata.expression = "3d6kl2";
        }

        actor.update({ "data.priority_roll": adata});
    }
    
    if(item.type == "armor" && ("equipped" in changed.data)) {

        var bonusIsMain;
        var penaltyIsMain;
        const armData = item.data;
        const actorData = duplicate(actor.data.data);
        let equipped = armData.equipped;
        let fixed = armData.protection.fixed;
        let vbl = armData.protection.variable;
        let isAccessory = armData.accessory;
        let bAttrib = armData.bonus.to;
        let bVal = armData.bonus.amount;
        let pAttrib = armData.penalty.to;
        let pVal = armData.penalty.amount;


        console.log("actor data", actorData);
        console.log("bAttrib / val: ", bAttrib, bVal);
        console.log("pAttrib / val: ", pAttrib, pVal);

        if(equipped) {
            if(bAttrib != "none" && ma.includes(bAttrib)) {
                actorData.main_attributes[bAttrib].rank += bVal;
            } else if (bAttrib != "none" && ca.includes(bAttrib)) {
                actorData.combat_attributes[bAttrib].rank += bVal;
            }
            if(pAttrib != "none" && ma.includes(pAttrib)) {
                actorData.main_attributes[pAttrib].rank -= pVal;
            } else if (pAttrib != "none" && ca.includes(pAttrib)) {
                actorData.combat_attributes[pAttrib].rank -= pVal;
            }
            if(isAccessory){
                actorData.armorbonus += fixed;
                console.log("Actor armor bonus: ", actorData.armorbonus);
            }
        }
        if(!equipped) {
            if(bAttrib != "none" && ma.includes(bAttrib)) {
                actorData.main_attributes[bAttrib].rank -= bVal;
            } else if (bAttrib != "none" && ca.includes(bAttrib)) {
                actorData.combat_attributes[bAttrib].rank -= bVal;
            }
            if(pAttrib != "none" && ma.includes(pAttrib)) {
                actorData.main_attributes[pAttrib].rank += pVal;
            } else if (pAttrib != "none" && ca.includes(pAttrib)) {
                actorData.combat_attributes[pAttrib].rank += pVal;
            }
            if(isAccessory) {
                actorData.armorbonus = Math.max(0, actorData.armorbonus - fixed);
                console.log("Actor armor bonus: ", actorData.armorbonus);
            }
        }
        
        actor.update({ "data": actorData});

    }
        
});


Hooks.on('deleteOwnedItem', function(actor, item){

    const ma = ["strength", "agility", "mind", "appeal"];
    const ca = ["melee", "ranged", "defense", "initiative"];
    
    let type = item.type;

    if (type == "trait") {
        let pmod = item.data.priority_dieMod;
        const adata = duplicate(actor.data.data.priority_roll);

        console.log("Adata (del): ", adata);

        if(type=="trait" && pmod != "none") {
            adata.expression = "2d6kh2";
        }
    
   
         actor.update({ "data.priority_roll": adata});
    }

    if (type == "armor") {

        var bonusIsMain;
        var penaltyIsMain;
        const armData = item.data;
        const actorData = duplicate(actor.data.data);
        let equipped = armData.equipped;
        let fixed = armData.protection.fixed;
        let vbl = armData.protection.variable;
        let isAccessory = armData.accessory;
        let bAttrib = armData.bonus.to;
        let bVal = armData.bonus.amount;
        let pAttrib = armData.penalty.to;
        let pVal = armData.penalty.amount;

        console.log("actor data", actorData);
        console.log("bAttrib / val: ", bAttrib, bVal);
        console.log("pAttrib / val: ", pAttrib, pVal);

        if(equipped) {
            if(bAttrib != "none" && ma.includes(bAttrib)) {
                actorData.main_attributes[bAttrib].rank -= bVal;
            } else if (bAttrib != "none" && ca.includes(bAttrib)) {
                actorData.combat_attributes[bAttrib].rank -= bVal;
            }
            if(pAttrib != "none" && ma.includes(pAttrib)) {
                actorData.main_attributes[pAttrib].rank += pVal;
            } else if (pAttrib != "none" && ca.includes(pAttrib)) {
                actorData.combat_attributes[pAttrib].rank += pVal;
            }
            if(isAccessory){
                actorData.armorbonus = Math.max(0, actorData.armorbonus - fixed);
            }
        }
        
        actor.update({ "data": actorData});
    }
});

/**
 * Chat Display Hooks
 */

// Add the necessary tooltip toggles

Hooks.on('renderChatMessage', (app, html) => {

    html.on('click', '.taskroll-msg', event => {
        event.preventDefault();
        // NOTE: This depends on the exact card template HTML structure.
        $(event.currentTarget).siblings('.taskroll-tt').slideToggle("fast");
     });
 
     html.on('click', '.taskroll-info', event => {
        event.preventDefault();
        // NOTE: This depends on the exact card template HTML structure.
        $(event.currentTarget).siblings('.taskroll-tt').slideToggle("fast");
     });

     /* html.on('click', '#legendize', event => {
        event.preventDefault();

        let element = event.currentTarget;
       
        let actorId = element.dataset.actorId;

        let actor = game.actors.get(actorId);


        if(!actor.data.data.isRival && !actor.data.data.isRabble && !actor.data.data.isTough) {
            actor.spendHeroPoint();
        }
     }); */

});

/**
 * Initiative / Combat Hooks
 */

// Convert initiative to Everywhen Priority "ladder" if setting active
Hooks.on('updateCombatant', function(combat, changed, diff) {  

    if(game.settings.get("ewhen", "initType") != "EWhenPriority") { return; }

    if (!("initiative" in changed)) { return; }

    let cmbInit = diff.initiative;

    let newInit = EWCombat.convertInitiative(changed);

    console.log("Inits before and after: ", cmbInit, newInit);

    changed.initiative = newInit;
});


/**
 * Actor / Token Hooks
 */

Hooks.on('updateToken', function(token, changed, diff){

    console.log("Also Updating Token: ", token.name, token._id);

});

 