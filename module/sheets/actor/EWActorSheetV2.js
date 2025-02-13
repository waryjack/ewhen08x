import { EWDialogHelper } from "../../interaction/EWDialogHelper.js";
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export default class EWActorSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {


    /**
     * @override
     */

    static DEFAULT_OPTIONS = {
        title:"Character Sheet",
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
            statRoll: EWActorSheetV2.statRoll,
            attributeRoll: EWActorSheetV2.attributeRoll,
            weaponRoll: EWActorSheetV2.weaponRoll,
            armorRoll: EWActorSheetV2.armorRoll,
            editImage: this._onEditImage,

        },
        form: {
                submitOnChange: true,
                closeOnSubmit: false,
        },
        position:{
            width:800,
            height:700,
            left:120
        },
        tag:"form",
        window:{
            title:"EW.game_term.charactersheet",
            contentClasses:['scrollable'],
            resizable:true
        },
        dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    }

    
    static PARTS = {
        form: {
            template: "systems/ewhen/templates/actor/charactersheet.hbs",
            scrollable: ['scrollable']
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
     

      
        data.config = CONFIG.ewhen; 
        let ownedItems = this.actor.items;
        data.actor = this.actor;
        data.gameSettings = game.settings.get("ewhen", "allSettings");

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
            data.pools = ownedItems.filter(function(item) {return item.type == "pointpool"});
                if (!Array.isArray(data.pools) || data.pools.length == 0) {
                    data.hasPools = false;
                } else {
                    data.hasPools = true;
                }
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
        console.log("New V2 Context: ", data);
        return data;
    }

    get title() {
        let minorType = "hero";
        if(this.actor.type === "vehicle") {
            minorType = "vehicle"
        } else if (this.actor.isRival) {
            minorType = "rival"
        } else if (this.actor.isRabble) {
            minorType = "rabble"
        } else if (this.actor.isTough) {
            minorType = "tough"
        }

        return `Everywhen ${game.i18n.localize(this.options.window.title)}: ${game.i18n.localize("EW.sheet.title."+minorType)}`;
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
    static becomeMinorNPC(event,element) {
        event.preventDefault();


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
    static adjustResource(event,element) {
        event.preventDefault();
        let resData = {};
      
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

    static adjustFrame(event,element) {
        event.preventDefault();


        let dialogData = {
            actor: this.actor,
            resinfo: foundry.utils.duplicate(this.actor.system.frame),
            resname: "EW.activity.adjustframe",
            res:"frame"
        }

        return EWDialogHelper.generateVehicleUpdateDialog(CONFIG.ewhen.DIALOG_TYPE.VEHICLE_RESOURCE_UPDATE, dialogData);

    }

    static adjustShield(event,element) {
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
    static careerRoll(event,element) {
        event.preventDefault();

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        let itemRank = item.system.rank;

        return this.actor.rollCareer(item);

    }

    // trigger the basic, non-pre-populated roll dialog; passthrough function from the sheet to the actor to the roll
    // gathering information along the way
    static async statRoll(event,element) {
        console.log("In actorsheet method statRoll");
        event.preventDefault();
        let chosenStat = element.dataset.attribute;

        await this.actor.rollStat(chosenStat);
    }

    // roll if the user clicks on a specific attribute or combat ability
    static attributeRoll(event, element) {
        event.preventDefault();
        var rank = 0;
        var isCombat = false;
        // let element = event.currentTarget;
        let attribute = element.dataset.attribute;
        let gameSettings = game.settings.get("ewhen","allSettings");
       
        let maPicked = "";
        let caPicked = "";

        let ma = ["strength", "agility", "mind", "appeal"];
        let ca = ["melee", "ranged", "defense", "initiative"];

        if(ca.includes(attribute)) {
            rank = this.actor.system.combat_attributes[attribute].rank;
            isCombat = true;
            caPicked = attribute;
            switch(caPicked) {
                case "melee": maPicked = gameSettings.meleeLink;break;
                case "ranged": maPicked = gameSettings.rangedLink;break;
                case "defense": maPicked = gameSettings.defenseLink;break;
                case "initiative": maPicked = gameSettings.initiativeLink;break;
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
    static weaponRoll(event,element) {
        event.preventDefault();

       /*
        let att2 = "agility";
        var att1;
       */

       

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        return this.actor.rollWeaponDamage(item);

    }

    static armorRoll(event,element) {
        event.preventDefault();

        
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        return this.actor.rollArmor(item);
    }

    static editItem(event, element) {
        console.log("Event: ", event);
        console.log("Element: ", element);
        event.preventDefault();

        

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        item.sheet.render(true);

    }

    static editCareerName(event,element) {
        event.preventDefault();
        

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        let field = element.dataset.field;

        return item.update({ [field]: element.innerText});

    }

    static editCareerRank(event, element) {
       
        event.preventDefault();
        
        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        let field = element.dataset.field;

        console.log("Career rank: ", field, element.value);
        return item.update({ [field]: element.value});

    }

    static addItem(event, options) {
        console.warn("Add Item Options: ", options.dataset.type);
        event.preventDefault();
        // console.warn("_addItem fired: ");
        var subtype = "";
        var locString = "EW.sheet.new";

       
        if(options.dataset.type == "trait"){
            subtype = options.dataset.subType;
            locString += subtype;
        } else {
            locString += options.dataset.type;
        }

        let itemData  = {
            name: game.i18n.localize(locString),
            type: options.dataset.type,
            data: {
                    type: subtype
            }
        }

        return Item.create(itemData, {parent: this.actor, renderSheet:true});

      }

      static deleteItem(event, element) {
          event.preventDefault();
         
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

      static equipItem(event,element) {
          event.preventDefault();

        

          let itemId = element.closest(".item").dataset.itemId;

          let item = this.actor.items.get(itemId);
          
          let field = element.dataset.field;

          let val = element.checked;

          return item.update({ [field]: val});

      }

      static async _onEditImage(_event, target) {
        if (target.nodeName !== "IMG") {
          throw new Error("The editImage action is available only for IMG elements.");
        }
        const attr = target.dataset.edit;
        const current = foundry.utils.getProperty(this.document._source, attr);
        const defaultArtwork = this.document.constructor.getDefaultArtwork?.(this.document._source) ?? {};
        const defaultImage = foundry.utils.getProperty(defaultArtwork, attr);
        const fp = new FilePicker({
          current,
          type: "image",
          redirectToRoot: defaultImage ? [defaultImage] : [],
          callback: path => {
            target.src = path;
            if (this.options.form.submitOnChange) {
              const submit = new Event("submit");
              this.element.dispatchEvent(submit);
            }
          },
          top: this.position.top + 40,
          left: this.position.left + 10
        });
        await fp.browse();
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