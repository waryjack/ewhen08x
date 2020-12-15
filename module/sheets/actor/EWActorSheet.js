export default class EWActorSheet extends ActorSheet {

    get template() {
        return "systems/ewhen/templates/actor/EWActorSheet.hbs"
    }

    /**
     * @override
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ['ewhen', 'sheet', 'actor', 'actor-sheet'],
        width: 750,
        height: 685,
        left:120
        });
    }
    
    /**
     * @override
     */
    getData () {
        const data = super.getData();

        //console.log(data);

        data.config = CONFIG.ewhen; 
        
        data.weapons = data.items.filter(function(item) {return item.type == "weapon"});
        data.careers = data.items.filter(function(item) {return item.type == "career"});
        data.traits = data.items.filter(function(item) {return item.type == "trait"});
        data.armors = data.items.filter(function(item) {return item.type == "armor"});
        data.powers = data.items.filter(function(item) {return item.type == "power"});
        data.equipment = data.items.filter(function(item) {return item.type == "equipment"});
        data.main_attributes = this.actor.data.data.main_attributes;
        data.combat_attributes = this.actor.data.data.combat_attributes;
        data.fdmg = this.actor.data.data.resources.lifeblood.fatigue;
        data.rdmg = this.actor.data.data.resources.lifeblood.regular;
        data.ldmg = this.actor.data.data.resources.lifeblood.lasting;
        data.crit = this.actor.data.data.resources.lifeblood.critical;
        data.cdmg = this.actor.data.data.resources.lifeblood.value;

      //      console.log("Data current damage: ", data.cdmg);
        return data;
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        html.find('.item-create').click(this._addItem.bind(this)); 

        html.find('.inline-edit').change(this._onCareerRankEdit.bind(this));
    
        html.find('.inline-edit-ce').blur(this._onCareerNameEdit.bind(this));

        html.find('.item-edit').click(this._onItemEdit.bind(this));

        html.find('.career-roll').click(this._onCareerRoll.bind(this));

        html.find('.item-delete').click(this._deleteItem.bind(this));

        html.find('.att-roll').click(this._onAttributeRoll.bind(this));

       // html.find('.com-roll').click(this._onCombatRoll.bind(this));

        html.find('.basic-roll').click(this._onBasicRoll.bind(this));

        html.find('.adj-resource').click(this._adjustResource.bind(this));

        html.find('.weapon-roll').click(this._onWeaponRoll.bind(this));

        html.find('.armor-roll').click(this._onArmorRoll.bind(this));

        html.find('.equip-item').change(this._onEquipItem.bind(this));

        html.find('.npc-boxes').change(this.onBecomeMinorNPC.bind(this));

    }

    // Change lifeblood, damage if you create a minor NPC from a character
    // one-way change; caught in preUpdateToken for reversing it
    onBecomeMinorNPC(event) {
        event.preventDefault();
       

       let element = event.currentTarget;
       let minorType = element.dataset.minorType;
       let actorData = duplicate(this.actor.data.data);
      
        let downgrade = element.checked;

        ui.notifications.warn(game.i18n.localize("EW.warnings.onewaytrip"));
        
        if(downgrade){
            switch(minorType) {
                case "tough": {
                    console.log("resources", actorData.resources);
                    actorData.resources.lifeblood.max = 5 + actorData.main_attributes.strength.rank;
                    actorData.resources.lifeblood.value = actorData.resources.lifeblood.max;
                    actorData.resources.resolve.max = 5 + actorData.main_attributes.mind.rank;
                    actorData.resources.resolve.value = actorData.resources.resolve.max;
                    return this.actor.update({ "data": actorData});
                }
                case "rabble": {
                    let actorData = duplicate(this.actor.data.data);
                   // console.log("resources");
                    actorData.resources.lifeblood.max = Math.floor(Math.random() * 4);
                    actorData.resources.lifeblood.value = actorData.resources.lifeblood.max; 
                    actorData.resources.resolve.max = 1;
                    actorData.resources.resolve.value = 1;
                    return this.actor.update({ "data": actorData});
                }
                default: {
                    actorData.resources.lifeblood.max = 10 + actorData.main_attributes.strength.rank;
                    actorData.resources.lifeblood.value = actorData.resources.lifeblood.max; 
                    actorData.resources.resolve.max = 10 + actorData.main_attributes.mind.rank;
                    actorData.resources.resolve.value = actorData.resources.resolve.max;
                    return this.actor.update({ "data": actorData});
                };
            }
        } else {
            let actorData = duplicate(this.actor.data.data);
            // console.log("resources");
             actorData.resources.lifeblood.max = 10 + actorData.main_attributes.strength.rank;
             actorData.resources.lifeblood.value = actorData.resources.lifeblood.max; 
             actorData.resources.resolve.max = 10 + actorData.main_attributes.mind.rank;
             actorData.resources.resolve.value = actorData.resources.resolve.max;
             return this.actor.update({ "data": actorData});
        }
    }

    // Handle changes to the lifeblood/resolve and critical tracks
    _adjustResource(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let res = element.dataset.resourceName;

        return this.actor.updateResource(res);
    }

    // Not in use at the moment; not sure if it's necessary
    _onCareerRoll(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.getOwnedItem(itemId);

        let itemRank = item.data.data.rank;
        
    }

    // trigger the basic, non-pre-populated roll dialog
    _onBasicRoll(event) {
        event.preventDefault();
        let element = event.currentTarget;

        return this.actor.basicRoll();
    }

    // roll if the user clicks on a specific attribute or combat ability
    _onAttributeRoll(event) {
        event.preventDefault();
        var rank = 0;
        var isCombat = false;
        let element = event.currentTarget;
        let attribute = element.dataset.attribute;
        let attribute2 = "";

        let ma = ["strength", "agility", "mind", "appeal"];
        let ca = ["melee", "ranged", "defense", "initiative"];

        if(ca.includes(attribute)) {
            rank = this.actor.data.data.combat_attributes[attribute].rank;
            isCombat = true;
        } else {
            rank = this.actor.data.data.main_attributes[attribute].rank;
        }

        if(isCombat) {
            switch (attribute) {
                // select the likely attribute if it's a combat roll 
                case "initiative": attribute2 = "mind"; break;
                default: attribute2 = "agility";
            }
        }
        

        // console.log("Attribute 1:", attribute, " Rank: ", rank);
        // console.log("Attribute 2: ", attribute2);
        
        return this.actor.rollAttribute(attribute, attribute2, isCombat, "");

    }

    // Handle damage rolls
    _onWeaponRoll(event) {
        event.preventDefault();

       /* 
        let att2 = "agility";
        var att1; 
       */

        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.getOwnedItem(itemId);
        
        return this.actor.rollWeaponDamage(item);

    }

    _onArmorRoll(event) {
        event.preventDefault();

        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.getOwnedItem(itemId);
        return this.actor.rollArmor(item);
    }

    _onItemEdit(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.getOwnedItem(itemId);

        item.sheet.render(true);

    }

    _onCareerNameEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.getOwnedItem(itemId);

        let field = element.dataset.field;
        
        return item.update({ [field]: element.innerText}); 

    }

    _onCareerRankEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.getOwnedItem(itemId);

        let field = element.dataset.field;
        
       // console.log("Career rank: ", field, element.value);
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
        return this.actor.createOwnedItem(itemData, {renderSheet:true});
         
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

      _onEquipItem(event) {
          event.preventDefault();

          let element = event.currentTarget;
          
          let itemId = element.closest(".item").dataset.itemId;
  
          let item = this.actor.getOwnedItem(itemId);
  
          let field = element.dataset.field;

          let val = element.checked;

          return item.update({ [field]: val}); 

      }



}