export default class EWPowerSheet extends ItemSheet {

    get template() {
        return "systems/ewhen/templates/item/EWPowerSheet.hbs"
    }

    getData () {
        const data = super.getData();

        data.config = CONFIG.ewhen; 
        
        return data;
    }
}