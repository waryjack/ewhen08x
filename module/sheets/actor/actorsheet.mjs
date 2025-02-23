
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;


export default class EWActorSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {

    EDIT_MODE = true;
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
            cycleBox: this._cycleBox,
            statRoll: this._statRoll,
            weaponRoll: this._rollWeaponDamage,
            armorRoll: this._rollArmorDefense,
            editImage: this._onEditImage,
            useHeroPoint: this._useHeroPoint,
            adjustStat: this._adjustStat,
            toggleEditMode: this._toggleEditMode,
            

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
        dragDrop: [{ dragSelector: '.draggable', dropSelector: null }],
    }

    
    static PARTS = {
        form: {
            template: "systems/ewhen/templates/actor/major.hbs",
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
            data.isMajor = (this.actor.type === "hero" || this.actor.type === "rival") ? true : false;
            data.editMode = this.EDIT_MODE;
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
        
        

    }

    // FIXME - these can be combined into _addCareerOrPool / _deleteCareerOrPool method
    // to streamline
    static async _addCareer(event, element) {
        await this.actor.system._addCareer();
    }

    static async _addPool(event, element) {
        event.preventDefault();
        await this.actor.system._addPool();
    }

    static async _deleteCareer(event, element) {
        event.preventDefault();
        console.log("Element: ", element.dataset)
        let career = element.dataset.career;
        let id = element.dataset.careerId;
        await this.actor.system._deleteCareer(career, id);
    }

    static async _deletePool(event, element) {
        event.preventDefault();
        console.log("Element: ", element.dataset)
        let pool = element.dataset.pool;
        let p_id = element.dataset.poolId;
        await this.actor.system._deletePool(pool, p_id);
    }

    static async _useHeroPoint(event, element) {
        if(this.actor.type === "rabble" || this.actor.type === "tought" || this.actor.type === "vehicle") {
            ui.notifications.error(game.i18n.localize("EW.warnings.cantspendhp"));   
            return;
        }
        event.preventDefault();
        return this.actor.system._useHeroPoint();
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
        let statId = element.dataset?.statId ?? "";

        await this.actor._statRoll(chosenStat, statId);
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

      static async _adjustStat(event, element){
        event.preventDefault();
        let stat = element.dataset.stat;
        let dir = element.dataset.dir;
        
            this.actor.system._adjustStat(stat, dir);

      }
      
      static _toggleEditMode() {
        this.EDIT_MODE = (this.EDIT_MODE == false) ? true : false;
        this.render({force:true})
      }

      get EDIT_MODE() {
        return this.EDIT_MODE;
      }

      /**
     * @param {boolean} bool
     */
      set EDIT_MODE(bool) {
        return this.EDIT_MODE = bool;
      }

  /* -------------------------------------------------- */
  /*   Drag and Drop               -- ripped directly from Draw Steel                     */
  /* -------------------------------------------------- */

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event) {
    const docRow = event.currentTarget.closest("[data-document-class]");
    if ("link" in event.target.dataset) return;

    // Chained operation
    let dragData = this._getEmbeddedDocument(docRow)?.toDragData();

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) {}

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call("dropActorSheetData", actor, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case "ActiveEffect":
        return this._onDropActiveEffect(event, data);
      case "Actor":
        return this._onDropActor(event, data);
      case "Item":
        return this._onDropItem(event, data);
      case "Folder":
        return this._onDropFolder(event, data);
    }
  }

  /**
   * Handle the dropping of ActiveEffect data onto an Actor Sheet
   * @param {DragEvent} event                  The concluding DragEvent which contains drop data
   * @param {object} data                      The data transfer extracted from the event
   * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
   * @protected
   */
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass("ActiveEffect");
    const effect = await aeCls.fromDropData(data);
    if (!this.actor.isOwner || !effect) return false;
    if (effect.target === this.actor)
      return this._onSortActiveEffect(event, effect);
    return aeCls.create(effect, {parent: this.actor});
  }

  /**
   * Handle a drop event for an existing embedded Active Effect to sort that Active Effect relative to its siblings
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  async _onSortActiveEffect(event, effect) {
    /** @type {HTMLElement} */
    const dropTarget = event.target.closest("[data-effect-id]");
    if (!dropTarget) return;
    const target = this._getEmbeddedDocument(dropTarget);

    // Don't sort on yourself
    if (effect.uuid === target.uuid) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (const el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      const parentId = el.dataset.parentId;
      if (
        siblingId &&
        parentId &&
        ((siblingId !== effect.id) || (parentId !== effect.parent.id))
      )
        siblings.push(this._getEmbeddedDocument(el));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(effect, {
      target,
      siblings
    });

    // Split the updates up by parent document
    const directUpdates = [];

    const grandchildUpdateData = sortUpdates.reduce((items, u) => {
      const parentId = u.target.parent.id;
      const update = {_id: u.target.id, ...u.update};
      if (parentId === this.actor.id) {
        directUpdates.push(update);
        return items;
      }
      if (items[parentId]) items[parentId].push(update);
      else items[parentId] = [update];
      return items;
    }, {});

    // Effects-on-items updates
    for (const [itemId, updates] of Object.entries(grandchildUpdateData)) {
      await this.actor.items
        .get(itemId)
        .updateEmbeddedDocuments("ActiveEffect", updates);
    }

    // Update on the main actor
    return this.actor.updateEmbeddedDocuments("ActiveEffect", directUpdates);
  }

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.actor.isOwner) return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await DrawSteelItem.fromDropData(data);

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid)
      return this._onSortItem(event, item);

    // Create the owned item
    return this._onDropItemCreate(item, event);
  }

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @returns {Promise<Item[]>}
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.actor.isOwner) return [];
    const folder = await Folder.implementation.fromDropData(data);
    if (folder.type !== "Item") return [];
    const droppedItemData = await Promise.all(
      folder.contents.map(async (item) => {
        if (!(document instanceof Item)) item = await fromUuid(item.uuid);
        return item;
      })
    );
    return this._onDropItemCreate(droppedItemData, event);
  }

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
   * @param {object[]|object} itemData      The item data requested for creation
   * @param {DragEvent} event               The concluding DragEvent which provided the drop data
   * @returns {Promise<Item[]>}
   * @private
   */
  async _onDropItemCreate(itemData, event) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments("Item", itemData);
  }

  /**
   * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings
   * @param {Event} event
   * @param {Item} item
   * @private
   */
  _onSortItem(event, item) {
    // Get the drag source and drop target
    const items = this.actor.items;
    const dropTarget = event.target.closest("[data-item-id]");
    if (!dropTarget) return;
    const target = items.get(dropTarget.dataset.itemId);

    // Don't sort on yourself
    if (item.id === target.id) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.itemId;
      if (siblingId && (siblingId !== item.id))
        siblings.push(items.get(el.dataset.itemId));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(item, {
      target,
      siblings
    });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    // Perform the update
    return this.actor.updateEmbeddedDocuments("Item", updateData);
  }

  /** The following pieces set up drag handling and are unlikely to need modification  */

  /**
   * Returns an array of DragDrop instances
   * @type {DragDrop[]}
   */
  get dragDrop() {
    return this.#dragDrop;
  }

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this)
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this)
      };
      return new DragDrop(d);
    });
  }

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop = this.#createDragDropHandlers();
}