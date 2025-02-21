const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export default class EWVehicleSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {


    /**
     * @override
     */

    static DEFAULT_OPTIONS = {
        title:"Character Sheet",
        actions:{
            cycleBox: this._cycleBox,
            editImage: this._onEditImage,
            addItem: this._addItem,
            editItem: this._editItem,
            deleteItem: this._deleteItem,
            weaponRoll: this._rollWeaponDamage,
            armorRoll: this._rollArmorDefense,

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
            title:"EW.game_term.vehiclesheet",
            contentClasses:['scrollable'],
            resizable:true
        },
        dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    }

    
    static PARTS = {
        form: {
            template: "systems/ewhen/templates/actor/vehicle.hbs",
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
        data.armor = ownedItems.filter(function(item) {return item.type == "armor"});
        data.shielded = this.actor.system.dipswitches.isShielded;
        console.log("alldata: ", data);
        
        data.shielded = true ; 
        return data;
    }

    get title() {
        return `Everywhen ${game.i18n.localize(this.options.window.title)}: ${game.i18n.localize("EW.sheet.title.vehicle")}`;
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

    // updateFrame() located in vehiclemodel
    static async updateFrame(event, element) {
        event.preventDefault();
        await this.actor._updateFrame();
    }

    // updateShield() located in basemodel
    static async updateShield(event, element) {
        event.preventDefault();
        await this.actor._updateShield();
    }

    static async _cycleBox(event, element) {
        event.preventDefault();
        let track = element.dataset.track;
        let pos = element.dataset.pos;
        let state = element.dataset.state;

        if (element.dataset.crit === "true") {
            await this.actor.system._cycleCritBox(track, pos, state);
        } else {
            await this.actor.system._cycleHitBox(track, pos, state);
        }
      }

    // trigger the basic, non-pre-populated roll dialog; passthrough function from the sheet to the actor to the roll
    // gathering information along the way
    static async statRoll(event,element) {
        console.log("In actorsheet method statRoll");
        event.preventDefault();
        let chosenStat = element.dataset.attribute;
        

        await this.actor.rollStat(chosenStat, "");
    }

    // Handle damage rolls
    static weaponRoll(event,element) {
        event.preventDefault();
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

      // Handle damage rolls
    static _rollWeaponDamage(event,element) {
        event.preventDefault();
        let item = this.actor.items.get(element.dataset.itemId);
        return item._rollWeaponDamage(this.actor.system.main_attributes);
    }

    static _rollArmorDefense(event,element) {
        event.preventDefault();
        console.log(element.dataset);
        if(element.dataset.varPro === "none") return; //don't roll armor with fixed protection
        let itemId = element.dataset.itemId;
        let item = this.actor.items.get(itemId);
        console.log("Item: ", item);
        return item._rollArmor();
    }

    static _editItem(event, element) {
        console.log("Event: ", event);
        console.log("Element: ", element);
        event.preventDefault();
        let itemId = element.dataset.itemId;
        let item = this.actor.items.get(itemId);
        console.log("Item to edit: ", item);
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
         
          let itemId = element.dataset.itemId;

          //TODO - Localize
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
