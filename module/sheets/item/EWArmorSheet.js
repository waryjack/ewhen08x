export default class EWArmorSheet extends ItemSheet {

    get template() {
        return "systems/ewhen/templates/item/EWARmorSheet.hbs"
    }

    getData () {
        const data = super.getData();

        data.config = CONFIG.ewhen; 
        
        return data;
    }
}