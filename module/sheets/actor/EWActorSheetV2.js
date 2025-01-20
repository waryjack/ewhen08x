import { EWDialogHelper } from "../../interaction/EWDialogHelper.js";
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export default class EWActorSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {


    /**
     * @override
     */

    static DEFAULT_OPTIONS = {
        id: "actorsheet",
        actions:{
            addItem: EWActorSheetV2.addItem,
            editItem: EWActorSheetV2.editItem,
            deleteItem: EWActorSheetV2.deleteItem,
            equipItem: EWActorSheetV2.equipItem,
            editCareerName: EWActorSheetV2.editCareerName,
            editCareerRank: EWActorSheetV2.editCareerRank,
            adjustResource: EWActorSheetV2.adjustResource,
            adjustFrame: EWActorSheetV2.adjustFrame,
            adjustShield: EWActorSheetV2.adjustShield,
            becomeMinorNPC: EWActorSheetV2.becomeMinorNPC,
            careerRoll: EWActorSheetV2.careerRoll,
            basicRoll: EWActorSheetV2.basicRoll,
            attributeRoll: EWActorSheetV2.attributeRoll,
            weaponRoll: EWActorSheetV2.weaponRoll,
            armorRoll: EWActorSheetV2.armorRoll,

        },
        position:{
           
            width: 900,
            left:120
        },
        tag:"form",
        window:{
            title:"V2 Actor Sheet"
        },
        dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    }

    static PARTS = {
        form: {
            template: "systems/ewhen/templates/actor/charactersheet.hbs",
        },
        /* tabs: {
            template: "templates/generic/tab-navigation.hbs"
        },
        mainAtts: {
            template: "systems/ewhen/templates/partials/MainAttributes.hbs"
        },
        combAtts: {
            template: "systems/ewhen/templates/partials/CombatAttributes.hbs"
        },
        careerList: {
            template: "systems/ewhen/templates/partials/CareerList.hbs"
        },
        boonList: {
            template: "systems/ewhen/templates/partials/BoonList.hbs"
        },
        flawList: {
            template: "systems/ewhen/templates/partials/FlawList.hbs"
        },
        weaponList: {

        },
        armorList: {

        },
        equipmentList: {

        },
        powerList: {

        } */
    }

    /**
     * @override
     */
    _prepareContext() {
        const data = foundry.utils.deepClone(this.actor.system);

       // // console.warn("080 super getdata, data.items: ", data);
        
        data.config = CONFIG.ewhen; 
        let ownedItems = this.actor.items;
        data.actor = this.actor; 

        // // console.warn("Owned Items: ", ownedItems);
        
        data.weapons = ownedItems.filter(function(item) {return item.type == "weapon"});
        //// console.warn("data.weapons: ", data.weapons);
        data.traits = ownedItems.filter(function(item) {return item.type == "trait"});
        //// console.warn("data.traits: ", data.traits);

        if (this.actor.type == "character") {
            data.careers = ownedItems.filter(function(item) {return item.type == "career"});
            data.armors = ownedItems.filter(function(item) {return item.type == "armor"});
            data.powers = ownedItems.filter(function(item) {return item.type == "power"});
            data.equipment = ownedItems.filter(function(item) {return item.type == "equipment"});
            data.main_attributes = this.actor.system.main_attributes;
            data.combat_attributes = this.actor.system.combat_attributes;
            data.fdmg = this.actor.system.resources.lifeblood.fatigue;
            data.rdmg = this.actor.system.resources.lifeblood.regular;
            data.ldmg = this.actor.system.resources.lifeblood.lasting;
            data.crit = this.actor.system.resources.lifeblood.critical;
            data.cdmg = this.actor.system.resources.lifeblood.value;
            data.EWActorType = "character";
        } else {
            data.EWActorType = "vehicle";
        }

        return data;
    }

    

    /**
     * @override
     */
    activateListeners() {
        const html = $(this.element);
        super.activateListeners(html);
        this.dragDrop.forEach((d) => d.bind(this.element));
        // Everything below here is only needed if the sheet is editable
        

    }

    // Change lifeblood, damage if you create a minor NPC from a character
    // one-way change; caught in preUpdateToken for reversing it
    static becomeMinorNPC(event) {
        event.preventDefault();


       let element = event.currentTarget;
       let minorType = element.dataset.minorType;
       let actorData = foundry.utils.duplicate(this.actor.system);
       let rabbleAttack = {

        name: "Rabble Attack",
        type: "weapon",
        data: {
            wpn_type:"hordeAttack",
                damage: {
                    dice:"1d3",
                    scale:1,
                    add_attribute:"none",
                    half_attribute:false,
                    mod:0,
                    ap:0
                },
                hands:"one handed",
                range:0,
                recoil:0,
                era:""
            }
        }
       let hordeAttack = {
        name: "Horde Attack",
        type: "weapon",
        data: {
            wpn_type:"hordeAttack",
                damage: {
                    dice:"2d6kl1",
                    scale:1,
                    add_attribute:"none",
                    half_attribute:false,
                    mod:0,
                    ap:0
                },
                hands:"one handed",
                range:0,
                recoil:0,
                era:""
            }
        }


        let downgrade = element.checked;

       // ui.notifications.warn(game.i18n.localize("EW.warnings.onewaytrip"));

        if(downgrade){
            switch(minorType) {
                case "tough": {
                    console.log("resources", actorData.resources);
                    actorData.resources.lifeblood.max = 5 + actorData.main_attributes.strength.rank;
                    actorData.resources.lifeblood.value = actorData.resources.lifeblood.max;
                    actorData.resources.resolve.max = 5 + actorData.main_attributes.mind.rank;
                    actorData.resources.resolve.value = actorData.resources.resolve.max;
                    return this.actor.update({ "system": actorData});
                }
                case "rabble": {
                    let actorData = foundry.utils.duplicate(this.actor.system);
                   // console.log("resources");
                    actorData.resources.lifeblood.max = Math.floor(Math.random() * 4);
                    actorData.resources.lifeblood.value = actorData.resources.lifeblood.max;
                    actorData.resources.resolve.max = 1;
                    actorData.resources.resolve.value = 1;
                    // Item.create(rabbleAttack, { parent: this.actor});
                    // Item.create(hordeAttack, { parent: this.actor});

                    return this.actor.update({ "system": actorData});
                }
                default: {
                    actorData.resources.lifeblood.max = 10 + actorData.main_attributes.strength.rank;
                    actorData.resources.lifeblood.value = actorData.resources.lifeblood.max;
                    actorData.resources.resolve.max = 10 + actorData.main_attributes.mind.rank;
                    actorData.resources.resolve.value = actorData.resources.resolve.max;
                    return this.actor.update({ "system": actorData});
                };
            }
        } else {
            let actorData = foundry.utils.duplicate(this.actor.system);
            // console.log("resources");
             actorData.resources.lifeblood.max = 10 + actorData.main_attributes.strength.rank;
             actorData.resources.lifeblood.value = actorData.resources.lifeblood.max;
             actorData.resources.resolve.max = 10 + actorData.main_attributes.mind.rank;
             actorData.resources.resolve.value = actorData.resources.resolve.max;
             return this.actor.update({ "system": actorData});
        }
    }

    // Handle changes to the lifeblood/resolve and critical tracks
    static adjustResource(event) {
        event.preventDefault();
        let resData = {};
        let element = event.currentTarget;

        let res = element.dataset.resourceName;
        

        if (res == "frame") {
            resData = foundry.utils.duplicate(this.actor.system.frame);
        } else {
            resData = foundry.utils.duplicate(this.actor.system.resources[res]);
        }


        let dialogData = {
            actor: this.actor,
            resname: "EW.activity.adjust"+res,
            resinfo: resData,
            res: res
        }



        return EWDialogHelper.generateUpdateDialog(CONFIG.ewhen.DIALOG_TYPE.RESOURCE_UPDATE, dialogData);
    }

    // May not be needed...testing required

    static adjustFrame(event) {
        event.preventDefault();


        let dialogData = {
            actor: this.actor,
            resinfo: foundry.utils.duplicate(this.actor.system.frame),
            resname: "EW.activity.adjustframe",
            res:"frame"
        }

        return EWDialogHelper.generateVehicleUpdateDialog(CONFIG.ewhen.DIALOG_TYPE.VEHICLE_RESOURCE_UPDATE, dialogData);

    }

    static adjustShield(event) {
        event.preventDefault();



        let dialogData = {
            actor: this.actor,
            resinfo: foundry.utils.duplicate(this.actor.system.resources.shield),
            resname: "EW.activity.adjustshield",
            res: "shield"
        }

        return EWDialogHelper.generateVehicleUpdateDialog(CONFIG.ewhen.DIALOG_TYPE.VEHICLE_RESOURCE_UPDATE, dialogData);

    }

    // Not in use at the moment; not sure if it's necessary
    static careerRoll(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        let itemRank = item.system.rank;

        return this.actor.rollCareer(item);

    }

    // trigger the basic, non-pre-populated roll dialog
    static basicRoll(event) {
        event.preventDefault();
        let element = event.currentTarget;

        return this.actor.basicRoll();
    }

    // roll if the user clicks on a specific attribute or combat ability
    static attributeRoll(event) {
        event.preventDefault();
        var rank = 0;
        var isCombat = false;
        let element = event.currentTarget;
        let attribute = element.dataset.attribute;
       
        let maPicked = "";
        let caPicked = "";

        let ma = ["strength", "agility", "mind", "appeal"];
        let ca = ["melee", "ranged", "defense", "initiative"];

        if(ca.includes(attribute)) {
            rank = this.actor.system.combat_attributes[attribute].rank;
            isCombat = true;
            caPicked = attribute;
            switch(caPicked) {
                case "melee": maPicked = game.settings.get("ewhen","meleeLink");break;
                case "ranged": maPicked = game.settings.get("ewhen", "rangedLink");break;
                case "defense": maPicked = game.settings.get("ewhen", "defenseLink");break;
                default: maPicked = "agility";
            }
        } else {
            rank = this.actor.system.main_attributes[attribute].rank;
            caPicked = "none";
            maPicked = attribute;
        }

        /* todo - set up attribute-ability links as a setting? or just remove defaults? 
        if(isCombat) {
            switch (attribute) {
                // select the likely attribute if it's a combat roll
                // case "initiative": attribute2 = "mind"; break;
                default: attribute2 = "agility";
            }
        }*/


        // console.log("Attribute 1:", attribute, " Rank: ", rank);
        // console.log("Attribute 2: ", attribute2);

        return this.actor.rollAttribute(maPicked, caPicked, isCombat, "");

    }

    // Handle damage rolls
    static weaponRoll(event) {
        event.preventDefault();

       /*
        let att2 = "agility";
        var att1;
       */

        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        return this.actor.rollWeaponDamage(item);

    }

    static armorRoll(event) {
        event.preventDefault();

        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        return this.actor.rollArmor(item);
    }

    static editItem(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        item.sheet.render(true);

    }

    static editCareerName(event) {
        event.preventDefault();
        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        let field = element.dataset.field;

        return item.update({ [field]: element.innerText});

    }

    static editCareerRank(event) {
        event.preventDefault();
        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        let field = element.dataset.field;

        console.log("Career rank: ", field, element.value);
        return item.update({ [field]: element.value});

    }

    static addItem(event) {
        event.preventDefault();
        // console.warn("_addItem fired: ");
        var subtype = "";
        var locString = "EW.sheet.new";

        let element = event.currentTarget;
        if(element.dataset.type == "trait"){
            subtype = element.dataset.subType;
            locString += subtype;
        } else {
            locString += element.dataset.type;
        }

        let itemData  = {
            name: game.i18n.localize(locString),
            type: element.dataset.type,
            data: {
                    type: subtype
            }
        }

        return Item.create(itemData, {parent: this.actor, renderSheet:true});

      }

      static deleteItem(event) {
          event.preventDefault();
          let element = event.currentTarget;
          let itemId = element.closest(".item").dataset.itemId;

          let d = new Dialog({
            title: "Delete This Item?",
            content: "<p>Are you sure you want to delete this item?</p>",
            buttons: {
             one: {
              icon: '<i class="fas fa-check"></i>',
              label: "Yes",
              callback: () => { 
                  let itemToDelete = this.actor.items.get(itemId);
                  itemToDelete.delete();
                }
             },
             two: {
              icon: '<i class="fas fa-times"></i>',
              label: "Cancel",
              callback: () => { return; }
             }
            },
            default: "two",
            render: html => console.log("Register interactivity in the rendered dialog"),
            close: html => console.log("This always is logged no matter which option is chosen")
           });
           d.render(true);

      }

      static equipItem(event) {
          event.preventDefault();

          let element = event.currentTarget;

          let itemId = element.closest(".item").dataset.itemId;

          let item = this.actor.items.get(itemId);
          
          let field = element.dataset.field;

          let val = element.checked;

          return item.update({ [field]: val});

      }

//       /* =============== Drag/Drop Handlers and Methods ======================= */

//       createDragDropHandlers() {
//         return this.options.dragDrop.map((d) => {
//           d.permissions = {
//             dragstart: this._canDragStart.bind(this),
//             drop: this._canDragDrop.bind(this),
//           };
//           d.callbacks = {
//             dragstart: this._onDragStart.bind(this),
//             dragover: this._onDragOver.bind(this),
//             drop: this._onDrop.bind(this),
//           };
//           return new DragDrop(d);
//         });
//     }

    

//     //getter
//     get dragDrop() {
//         return this.dragDrop;
//     }

//     /**
//    * Define whether a user is able to begin a dragstart workflow for a given drag selector
//    * @param {string} selector       The candidate HTML selector for dragging
//    * @returns {boolean}             Can the current user drag this selector?
//    * @protected
//    */
//     _canDragStart(selector) {
//         // game.user fetches the current user
//         return this.isEditable;
//     }

//     /**
//    * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
//    * @param {string} selector       The candidate HTML selector for the drop target
//    * @returns {boolean}             Can the current user drop on this selector?
//    * @protected
//    */
//     _canDragDrop(selector) {
//         // game.user fetches the current user
//         return this.isEditable;
//     }

//     /**
//    * Callback actions which occur at the beginning of a drag start workflow.
//    * @param {DragEvent} event       The originating DragEvent
//    * @protected
//    */
//     _onDragStart(event) {
//         const el = event.currentTarget;
//         if ('link' in event.target.dataset) return;

//         // Extract the data you need
//         let dragData = null;

//         if (!dragData) return;

//         // Set data transfer
//         event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
//     }

//       /**
//    * Callback actions which occur when a dragged element is over a drop target.
//    * @param {DragEvent} event       The originating DragEvent
//    * @protected
//    */
//      _onDragOver(event) {}


//   /**
//    * Callback actions which occur when a dragged element is dropped on a target.
//    * @param {DragEvent} event       The originating DragEvent
//    * @protected
//    */
//     async _onDrop(event) {
//         const data = TextEditor.getDragEventData(event);

//         // Handle different data types
//         switch (data.type) {
//             // write your cases
//         }
//     }

}