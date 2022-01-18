export default class EWVehicleSheet extends ActorSheet {

    get template() {
        return "systems/ewhen/templates/actor/EWVehicleSheet.hbs"
    }

     /**
     * @override
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ['ewhen', 'sheet', 'actor', 'actor-sheet'],
        width: 640,
        height: 400,
        left:120
        });
    }
    getData () {
        const data = super.getData();

        data.config = CONFIG.ewhen; 
        data.EWActorType = "vehicle";

        data.weapons = data.items.filter(function(item) {return item.type == "weapon"});
        
        data.traits = data.items.filter(function(item) {return item.type == "trait"});
        return data;
    }

     /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        html.find('.adj-resource').click(this._adjustResource.bind(this));

        html.find('.adj-frame').click(this._adjustFrame.bind(this));

        html.find('.item-create').click(this._addItem.bind(this)); 

        html.find('.item-edit').click(this._onItemEdit.bind(this));

        html.find('.item-delete').click(this._deleteItem.bind(this));

        let handler = (ev) => this._onDragStart(ev);
        html.find('.item-name').each((i, item) => {
            if (item.dataset && item.dataset.itemId) {
                item.setAttribute('draggable', true);
                item.addEventListener('dragstart', handler, false);
            }
        });

    }

    _adjustResource(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let res = element.dataset.resourceName;

        return this.actor.updateResource(res);
    }

    _adjustFrame(event) {
        event.preventDefault();

        return this.actor.updateResource();

    }

    _onItemEdit(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        item.sheet.render(true);

    }

    _addItem(event) {
        event.preventDefault();
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
        return Item.create(itemData, {parent:this.actor});
        
        // return this.actor.createOwnedItem(itemData, {renderSheet:true});
         
      }

      _deleteItem(event) {
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
}