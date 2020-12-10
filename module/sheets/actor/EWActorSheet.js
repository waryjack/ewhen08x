export default class EWActorSheet extends ActorSheet {

    get template() {
        return "systems/ewhen/templates/actor/EWActorSheet.hbs"
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ['ewhen', 'sheet', 'actor', 'actor-sheet'],
        width: 750,
        height: 685
        });
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
        data.main_attributes = this.actor.data.data.main_attributes;
        data.combat_attributes = this.actor.data.data.combat_attributes;
        data.fdmg = this.actor.data.data.resources.lifeblood.fatigue;
        data.rdmg = this.actor.data.data.resources.lifeblood.regular;
        data.ldmg = this.actor.data.data.resources.lifeblood.lasting;
        data.crit = this.actor.data.data.resources.lifeblood.critical;
        data.cdmg = this.actor.data.data.resources.lifeblood.current;

        console.log("Data current damage: ", data.cdmg);
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

        html.find('.basic-roll').click(this._onBasicRoll.bind(this));

        html.find('.adj-resource').click(this._adjustResource.bind(this));
        // html.find('.com-roll').click(this._onCombatRoll.bind(this));

        // html.find('.com-roll').click(this._onCombatRoll.bind(this));


    }

    _adjustResource(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let res = element.dataset.resourceName;

        return this.actor.updateResource(res);
    }

    _onRollCareer(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.getOwnedItem(itemId);

        let itemRank = item.data.data.rank;
        
    }

    _onBasicRoll(event) {
        event.preventDefault();
        let element = event.currentTarget;

        return this.actor.basicRoll();
    }

    _onAttributeRoll(event) {
        event.preventDefault();
        var rank;
        let element = event.currentTarget;
        let attribute = element.dataset.attribute;

        let ma = ["strength", "agility", "mind", "appeal"];
        let ca = ["melee", "ranged", "defense", "initiative"];

        if(ca.includes(attribute)) {
            rank = this.actor.data.data.combat_attributes[attribute].rank;
        } else {
            rank = this.actor.data.data.main_attributes[attribute].rank;
        }

        console.log("Attribute clicked:", attribute, " Rank: ", rank);
       // return this.actor.basicRoll();
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