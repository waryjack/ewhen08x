
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export default class EWActorSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {


    /**
     * @override
     */

    static DEFAULT_OPTIONS = {
        title:"Character Sheet",
        actions:{
            addCareer: this._addCareer,
            deleteCareer: this._deleteCareer,
            addPool: this._addPool,
            deletePool: this._deletePool,
            addItem: this._addItem,
            editItem: this._editItem,
            deleteItem: this._deleteItem,
            equipItem: this._equipItem,
            adjustResource: this._adjustResource,
            statRoll: this._statRoll,
            weaponRoll: this._weaponRoll,
            armorRoll: this._armorRoll,
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
        }
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

            // sheet variants for each type - rivals are regular characters; toughs, rabble, vehicle the others?
            data.careers = this.actor.system.careers;
            data.ckeys = Object.keys(data.careers);
            data.armors = ownedItems.filter(function(item) {return item.type == "armor"});
            data.powers = ownedItems.filter(function(item) {return item.type == "power"});
            data.equipment = ownedItems.filter(function(item) {return item.type == "equipment"});
            data.pools = this.actor.system.pools       
            data.main_attributes = this.actor.system.main_attributes;
            data.combat_attributes = this.actor.system.combat_attributes;
            data.fdmg = this.actor.system.resources.lifeblood.fatigue;
            data.rdmg = this.actor.system.resources.lifeblood.regular;
            data.ldmg = this.actor.system.resources.lifeblood.lasting;
            data.crit = this.actor.system.resources.lifeblood.critical;
            data.cdmg = this.actor.system.resources.lifeblood.value;
            data.EWActorType = this.actor.type;
       
        return data;
    }

    get title() {

        return `Everywhen ${game.i18n.localize(this.options.window.title)}: ${game.i18n.localize("EW.sheet.title."+this.actor.type)}`;
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

    static async _addCareer(event, element) {
        await this.actor._addCareer();
    }

    static _addPool(event, element) {
        event.preventDefault();
        return this.actor._addPool();
    }

    static async _deleteCareer(event, element) {
        event.preventDefault();
        console.log("Element: ", element.dataset)
        let career = element.dataset.career;
        let id = element.dataset.careerId;
        return this.actor._deleteCareer(career, id);
    }

    static async _deletePool() {
        await this.actor._deletePool();
    }
    // Change lifeblood, damage if you create a minor NPC from a character
    // one-way change; caught in preUpdateToken for reversing it
   
    // Handle changes to the lifeblood/resolve and critical tracks
    static _adjustResource(event,element) {
        event.preventDefault();
        let res = element.dataset.resourceName;
        return this.actor._adjustResource(res);
    }

    // trigger the basic, non-pre-populated roll dialog; passthrough function from the sheet to the actor to the roll
    // gathering information along the way
    static async _statRoll(event,element) {
        console.log("In actorsheet method statRoll");
        event.preventDefault();
        let chosenStat = element.dataset.attribute;
        let statId = element.dataset.id;

        await this.actor.rollStat(chosenStat, statId);
    }

    // Handle damage rolls
    static _weaponRoll(event,element) {
        event.preventDefault();
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        return this.actor.rollWeaponDamage(item);

    }

    static _armorRoll(event,element) {
        event.preventDefault();
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        return this.actor.rollArmor(item);
    }

    static _editItem(event, element) {
        console.log("Event: ", event);
        console.log("Element: ", element);
        event.preventDefault();
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        item.sheet.render(true);

    }

    static _addItem(event, options) {
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

      static _deleteItem(event, element) {
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

      static _equipItem(event,element) {
        // should probably go to the datamodel since its type-specific
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