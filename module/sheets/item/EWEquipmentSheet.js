export default class EWEquipmentSheet extends ItemSheet {

    get template() {
        return "systems/ewhen/templates/item/EWEquipmentSheet.hbs"
    }

    getData () {
        const data = super.getData();

        data.config = CONFIG.ewhen; 
        
        return data;
    }
}