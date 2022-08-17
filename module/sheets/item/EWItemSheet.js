export default class EWItemSheet extends ItemSheet {

    // Note: Careers have basically just a name and an optional description; but the sheet is needed for item creation;
    
    get template() {
        const path = 'systems/ewhen/templates/item/';
        return `${path}${this.item.type}sheet.hbs`;
    }

    getData () {
        const data = this.item.system;
        data.item = this.item;
        data.myName = data.name;
        data.config = CONFIG.ewhen; 
        
        return data;
    }
}