// Imports

import { preloadHandlebarsTemplates } from "./templates.js";
import { EW } from "./config.js";
import { registerSettings } from "./settings.js";
import * as rolls from "./roll/_exports.mjs";
import * as data from "./datamodels/_exports.mjs";
import * as sheets from "./sheets/_exports.mjs";
import * as docs from "./documents/_exports.mjs";

Hooks.once("init", () => {
    console.log("ewhen | Initializing Everywhen System");

    CONFIG.ewhen = EW;

    // Add namespace in global

    game.EW = {
        data,
        sheets,
        rolls,
        docs,
        registerSettings
    };

    // Register System sheets
   Actors.unregisterSheet("core", ActorSheet);
   Actors.registerSheet("ewhen", sheets.EWActorSheetV2, { 
        types:["hero","rival","rabble","tough","horde"], makeDefault:true 
    });
    Actors.registerSheet("ewhen", sheets.EWVehicleSheetV2, {
        types:["vehicle"], makeDefault:true
    });

      // `Actors.registerSheet` is semantically equivalent to passing Actor as the first argument
      // This works for all world collections, e.g. Items
      //Actors.registerSheet("package-id", EWActorSheetV2, {})
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("ewhen", sheets.EWItemSheetV2, {
        types: ["trait", "power", "armor", "weapon", "equipment"],
        makeDefault:true 
    });

    // Register Item Datamodels
   
    Object.assign(CONFIG.Actor.dataModels, {
        hero: data.EWHeroData,
        rival: data.EWRivalData,
        tough: data.EWToughData,
        rabble: data.EWRabbleData,
        vehicle: data.EWVehicleData,
        horde: data.EWHordeData
    })

    Object.assign(CONFIG.Item.dataModels, {
        equipment: data.EWEquipmentData,
        power: data.EWPowerData,
        trait: data.EWTraitData,
        weapon: data.EWWeaponData,
        armor: data.EWArmorData
    })
    

    // CONFIG.debug.hooks = true;
    // assign document classes (multiple classes need assignment)
    console.log("For learning a thing: ", Object.values(docs));
    
    CONFIG.Actor.documentClass = docs.EWBaseActor;
    CONFIG.Item.documentClass = docs.EWBaseItem;



    CONFIG.Combat.documentClass = docs.EWCombat;
    CONFIG.Dice.rolls = [rolls.EWBaseRoll, rolls.EWMCCRoll, rolls.EWArmorRoll, rolls.EWWeaponRoll];
    
    // Register system settings
    registerSettings();
    // migrate old System settings
    
    
   

    // initiative value investigation

    

        // set linked attributes for combat

        if ("combatLinks" in game.system) {
            // leave it be
        } else {
            game.system.combatLinks = {
                melee:"agility",
                ranged:"agility",
                defense:"agility",
                initiative:"mind"
            }
        }

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
        // console.warn("Passed Setting Name: ", arg);
        if (arg == "" || arg == "non" || arg == undefined) { return ; }
        return game.settings.get('ewhen', 'allSettings')[arg];
    });

    
    Handlebars.registerHelper("concat", function(...args){
        let result = "";
        for (let a of args) {
            result += a;
        }

        return result;
    });

    Handlebars.registerHelper("getCustomName", function(a) {
        if (a == "none" || a == "None" || a == "") { return; }
        let result = "Name";
        let truncA = a.substring(0,3);
        result = truncA+result;
       // console.warn("Custom Name", result);
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

Hooks.on('updateItem', function(actor, item, changed){

    const ma = ["strength", "agility", "mind", "appeal"];
    const ca = ["melee", "ranged", "defense", "initiative"];

    if(item.type == "armor" && ("equipped" in changed.data)) {

        var bonusIsMain;
        var penaltyIsMain;
        const armData = item.system;
        const actorData = foundry.utils.duplicate(actor.system);
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

        actor.update({ "system": actorData});

    }

});



// the item actually vanishes from the inventory

Hooks.on('deleteItem', function(actor, item){ 


    const ma = ["strength", "agility", "mind", "appeal"];
    const ca = ["melee", "ranged", "defense", "initiative"];

    let type = item.type;

  

    if (type == "armor") {

        var bonusIsMain;
        var penaltyIsMain;
        const armData = item.system;
        const actorData = foundry.utils.duplicate(actor.system);
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

        actor.update({ "system": actorData});
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

     html.on('click', '.chat-rolltooltip', event => {
        event.preventDefault();
        console.log("clicked the chat message");
        // NOTE: This depends on the exact card template HTML structure.
        $(event.currentTarget).siblings('.taskroll-tt').slideToggle("fast");
     });

     html.on('click', '#legendize', event => {
        event.preventDefault();

        let element = event.currentTarget;

        let actorId = element.dataset.actorId;

        let actor = game.actors.get(actorId);


        if(!actor.system.isRival && !actor.system.isRabble && !actor.system.isTough) {
            actor.spendHeroPoint();
        }
     });

});

/**
 * Initiative / Combat Hooks
 */

// Convert initiative to Everywhen Priority "ladder" if setting active
Hooks.on('preUpdateCombatant', function(combatant, changed, diff) {

 
    if(game.settings.get("ewhen", "allSettings").priority) { return; }

    if (!("initiative" in changed)) { return; }

});

/**
 * Combat hook - maybe for future work


Hooks.on('getCombatTrackerEntryContext', (tracker, options) => {

    //options.splice(2,1); 
});
 */

/**
 * Actor / Token Hooks
 */

Hooks.on('updateToken', function(token, changed, diff){

    console.log("Also Updating Token: ", token.name, token._id);

});

Hooks.on('preCreateItem', function(item, data) {
    //console.warn("first argument: ", item, "second arg", data);
    //console.warn("item type: ", item.type);
    if (item.type == "weapon") {
         item._source.img = "icons/svg/sword.svg";
     } else if (item.type == "armor") {
        item._source.img = "icons/svg/shield.svg";
     } else if (item.type == "trait") {
        item._source.img = "icons/svg/dice-target.svg";
     } else if (item.type == "career") {
        item._source.img = "icons/svg/book.svg";
     } else if (item.type == "equipment") {
        item._source.img = "icons/svg/chest.svg";
     } else if (item.type == "power") {
        item._source.img = "icons/svg/daze.svg";
     }
 
 });
 
 Hooks.on('preCreateOwnedItem', function(item, data) {
   //console.warn("enter precreateowneditem hook");
    //console.warn("first argument: ", item, "second arg", data);
    if (item.type == "weapon") {
        item._source.img = "icons/svg/sword.svg";
    } else if (item.type == "armor") {
       item._source.img = "icons/svg/shield.svg";
    } else if (item.type == "trait") {
       item._source.img = "icons/svg/dice-target.svg";
    } else if (item.type == "career") {
       item._source.img = "icons/svg/book.svg";
    } else if (item.type == "equipment") {
       item._source.img = "icons/svg/chest.svg";
    } else if (item.type == "power") {
       item._source.img = "icons/svg/daze.svg";
    }
 });

