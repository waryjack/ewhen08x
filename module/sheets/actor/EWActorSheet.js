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

        html.find('.item-create').click(this._addCareer.bind(this)); 

        html.find('.inline-edit').change(this._onCareerEdit.bind(this));

        html.find('.item-edit').click(this._onItemEdit.bind(this));

        html.find('.career-roll').click(this._onRollCareer.bind(this));

    }

    _onRollCareer(event) {
        event.preventDefault();

        let element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        let item = this.actor.getOwnedItem(itemId);

        let itemRank = item.data.data.rank;
        
        let roll = new Roll("2d6+"+itemRank);

        roll.roll().toMessage();
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

    _addCareer(event) {
        event.preventDefault();
        let element = event.currentTarget;

        let itemData  = {
            name: game.i18n.localize("EW.sheet.newCareer"),
            type: element.dataset.type,
        }
        return this.actor.createOwnedItem(itemData);
         
      }


}