export default class EWActorSheet extends ActorSheet {

    get template() {
        return "systems/ewhen/templates/actor/EWActorSheet.hbs"
    }

    
    getData () {
        const data = super.getData();

        console.log(data);

        data.config = CONFIG.ewhen; 
        
        data.weapons = data.items.filter(function(item) {return item.type == "weapon"});
        data.careers = data.items.filter(function(item) {return item.type == "career"});
        data.traits = data.items.filter(function(item) {return item.type == "trait"});
        data.armor = data.items.filter(function(item) {return item.type == "armor"});
        data.powers = data.items.filter(function(item) {return item.type == "power"});
        data.equipment = data.items.filter(function(item) {return item.type == "equipment"});
        

        console.log(data.careers);
        return data;
    }

    // @override
    activateListeners(html) {
        super.activateListeners(html);
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        html.find('.item-create').click(this._addItem.bind(this)); 

        html.find('.inline-edit').change(this._onCareerEdit.bind(this));

        html.find('.item-edit').click(this._onItemEdit.bind(this));

       // html.find('.career-roll').click(this._onRollCareer.bind(this));

        html.find('.item-delete').click(this._deleteItem.bind(this));

        html.find('.att-roll').click(this._onAttributeRoll.bind(this));

        // html.find('.com-roll').click(this._onCombatRoll.bind(this));


    }

    _onRollCareer(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.getOwnedItem(itemId);

        let itemRank = item.data.data.rank;
        
    }

    _onAttributeRoll(event) {
        event.preventDefault();

        let element = event.currentTarget;
        let attribute = element.closest(".statroll").dataset.attribute;

        return this.actor.rollAttribute(attribute, {event: event});

        let rank = this.actor.data.data.attributes[attribute].rank;
        console.log("Attribute clicked:", attribute, " Rank: ", rank);
    }

    _onItemEdit(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.getOwnedItem(itemId);

        item.sheet.render(true);

    }

    _onCareerEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.getOwnedItem(itemId);

        let field = element.dataset.field;

        return item.update({ [field]: element.value}); 

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
        return this.actor.createOwnedItem(itemData);
         
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
              callback: () => { this.actor.deleteOwnedItem(itemId) }
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