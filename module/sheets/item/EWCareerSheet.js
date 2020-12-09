export default class EWCareerSheet extends ItemSheet {

    get template() {
        return "systems/ewhen/templates/item/EWCareerSheet.hbs"
    }

    getData () {
        const data = super.getData();

        data.config = CONFIG.ewhen; 
        
        return data;
    }
}