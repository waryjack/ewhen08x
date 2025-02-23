
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;
import EWBaseActor from "../../documents/actor/baseactor.mjs"

export default class EWRabbleSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {

    EDIT_MODE = true;

    /**
     * @override
     */

    static DEFAULT_OPTIONS = {
        title:"Character Sheet",
        actions:{
            addCareer: this._addCareer,
            deleteCareer: this._deleteCareer,
            adjustResource: this._adjustResource,
            addPool:this._addPool,
            deletePool: this._deletePool,
            editPool: this._editPool,
            addItem: this._addItem,
            editItem: this._editItem,
            deleteItem: this._deleteItem,
            rollDamage: this._rollDamage,
            editImage: this._onEditImage,
            statRoll: this._statRoll,
            toggleEditMode: this._toggleEditMode
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
        //dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    }

    
    static PARTS = {
        form: {
            template: "systems/ewhen/templates/actor/rabble.hbs",
            scrollable: ['scrollable']
        }
    }

    /**
     * @override
     */
    _prepareContext() {
        const data = foundry.utils.deepClone(this.actor.system);
     
        data.config = CONFIG.ewhen; 
        data.actor = this.actor;
        data.gameSettings = game.settings.get("ewhen", "allSettings");
        let ownedItems = this.actor.items;
        data.powers = ownedItems.filter(i => i.type === "power");
        // // console.warn("Owned Items: ", ownedItems);
        
        data.careers = this.actor.system.careers;
        data.ckeys = Object.keys(data.careers);
        data.editMode = this.EDIT_MODE;
        data.isMajor = false;
       
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
        // Everything below here is only needed if the sheet is editable
        

    }

    static async _addPool(event, element) {
        event.preventDefault();
        await this.actor.system._addPool();
    }


    static async _deletePool(event, element) {
        event.preventDefault();
        console.log("Element: ", element.dataset)
        let pool = element.dataset.pool;
        let p_id = element.dataset.poolId;
        await this.actor.system._deletePool(pool, p_id);
    }

    static async _statRoll(event,element) {
        console.log("In actorsheet method statRoll");
        event.preventDefault();
        let chosenStat = element.dataset.attribute;
        let statId = element.dataset?.statId ?? "";
        await this.actor._statRoll(chosenStat, statId);
    }

    static async _addCareer(event, element) {
        await this.actor.system._addCareer();
    }

    static async _deleteCareer(event, element) {
        event.preventDefault();
        console.log("Element: ", element.dataset)
        let career = element.dataset.career;
        let id = element.dataset.careerId;
        return this.actor.system._deleteCareer(career, id);
    }

    static async _rollDamage(event,element) {
        event.preventDefault();
        await this.actor._rollRabbleDamage()
    }

    // Handle changes to the lifeblood/resolve and critical tracks
    static _adjustResource(event,element) {
        event.preventDefault();
        let res = element.dataset.resourceName;
        return this.actor._adjustResource(res);
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

        // add bailout if this is not a power; Rabble don't get weapons or armor
        if (options.dataset.type !== "power") return;
        
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
      
      static _toggleEditMode() {
        this.EDIT_MODE = (this.EDIT_MODE === false) ? true : false;
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


}