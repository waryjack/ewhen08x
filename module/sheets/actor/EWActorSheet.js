import { EWDialogHelper } from "../../interaction/EWDialogHelper.js";

export default class EWActorSheet extends ActorSheet {

    get template() {
        const path = 'systems/ewhen/templates/actor/';
        return `${path}${this.actor.data.type}sheet.hbs`;
    }

    /**
     * @override
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ['ewhen', 'sheet', 'actor', 'actor-sheet'],
        width: 775,
        height: 685,
        left:120,
        tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheetbody", initial: "main"}],
        dragDrop: [{dragSelector: ".dragline", dropSelector: null}]
        });
    }

    /**
     * @override
     */
    getData() {
        const data = deepClone(this.actor.data);

       // console.warn("080 super getdata, data.items: ", data);
        
        data.config = CONFIG.ewhen; 
        let ownedItems = this.actor.items;
        data.actor = this.actor; 

        // console.warn("Owned Items: ", ownedItems);
        
        data.weapons = ownedItems.filter(function(item) {return item.type == "weapon"});
        //console.warn("data.weapons: ", data.weapons);
        data.traits = ownedItems.filter(function(item) {return item.type == "trait"});
        //console.warn("data.traits: ", data.traits);

        if (this.actor.data.type == "character") {
        data.careers = ownedItems.filter(function(item) {return item.type == "career"});
        data.armors = ownedItems.filter(function(item) {return item.type == "armor"});
        data.powers = ownedItems.filter(function(item) {return item.type == "power"});
        data.equipment = ownedItems.filter(function(item) {return item.type == "equipment"});
        data.main_attributes = this.actor.data.data.main_attributes;
        data.combat_attributes = this.actor.data.data.combat_attributes;
        data.fdmg = this.actor.data.data.resources.lifeblood.fatigue;
        data.rdmg = this.actor.data.data.resources.lifeblood.regular;
        data.ldmg = this.actor.data.data.resources.lifeblood.lasting;
        data.crit = this.actor.data.data.resources.lifeblood.critical;
        data.cdmg = this.actor.data.data.resources.lifeblood.value;
        data.EWActorType = "character";
        } else {
            data.EWActorType = "vehicle";
        }

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

        html.find('.adj-frame').click(this._adjustFrame.bind(this));

        html.find('.adj-shield').click(this._adjustShield.bind(this));

        let handler = (ev) => this._onDragStart(ev);
        html.find('.item-name').each((i, item) => {
            if (item.dataset && item.dataset.itemId) {
                item.setAttribute('draggable', true);
                item.addEventListener('dragstart', handler, false);
            }
        });

    }

    // Change lifeblood, damage if you create a minor NPC from a character
    // one-way change; caught in preUpdateToken for reversing it
    onBecomeMinorNPC(event) {
        event.preventDefault();


       let element = event.currentTarget;
       let minorType = element.dataset.minorType;
       let actorData = duplicate(this.actor.data.data);
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
                    return this.actor.update({ "data": actorData});
                }
                case "rabble": {
                    let actorData = duplicate(this.actor.data.data);
                   // console.log("resources");
                    actorData.resources.lifeblood.max = Math.floor(Math.random() * 4);
                    actorData.resources.lifeblood.value = actorData.resources.lifeblood.max;
                    actorData.resources.resolve.max = 1;
                    actorData.resources.resolve.value = 1;
                    // Item.create(rabbleAttack, { parent: this.actor});
                    // Item.create(hordeAttack, { parent: this.actor});

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
        let resData = {};
        let element = event.currentTarget;

        let res = element.dataset.resourceName;
        

        if (res == "frame") {
            resData = duplicate(this.actor.data.data.frame);
        } else {
            resData = duplicate(this.actor.data.data.resources[res]);
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

    _adjustFrame(event) {
        event.preventDefault();


        let dialogData = {
            actor: this.actor,
            resinfo: duplicate(this.actor.data.data.frame),
            resname: "EW.activity.adjustframe",
            res:"frame"
        }

        return EWDialogHelper.generateVehicleUpdateDialog(CONFIG.ewhen.DIALOG_TYPE.VEHICLE_RESOURCE_UPDATE, dialogData);

    }

    _adjustShield(event) {
        event.preventDefault();



        let dialogData = {
            actor: this.actor,
            resinfo: duplicate(this.actor.data.data.resources.shield),
            resname: "EW.activity.adjustshield",
            res: "shield"
        }

        return EWDialogHelper.generateVehicleUpdateDialog(CONFIG.ewhen.DIALOG_TYPE.VEHICLE_RESOURCE_UPDATE, dialogData);

    }

    // Not in use at the moment; not sure if it's necessary
    _onCareerRoll(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

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

        // todo - set up attribute-ability links as a setting? or just remove defaults? 
        if(isCombat) {
            switch (attribute) {
                // select the likely attribute if it's a combat roll
                // case "initiative": attribute2 = "mind"; break;
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

        let item = this.actor.items.get(itemId);

        return this.actor.rollWeaponDamage(item);

    }

    _onArmorRoll(event) {
        event.preventDefault();

        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        return this.actor.rollArmor(item);
    }

    _onItemEdit(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        item.sheet.render(true);

    }

    _onCareerNameEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        let field = element.dataset.field;

        return item.update({ [field]: element.innerText});

    }

    _onCareerRankEdit(event) {
        event.preventDefault();
        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.items.get(itemId);

        let field = element.dataset.field;

       // console.log("Career rank: ", field, element.value);
        return item.update({ [field]: element.value});

    }

    _addItem(event) {
        event.preventDefault();
        console.warn("_addItem fired: ");
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

          let item = this.actor.items.get(itemId);
  
          let item = this.actor.getOwnedItem(itemId);

          let field = element.dataset.field;

          let val = element.checked;

          return item.update({ [field]: val});

      }



}