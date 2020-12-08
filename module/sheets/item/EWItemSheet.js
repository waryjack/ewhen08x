export class EWItemSheet extends ItemSheet {

    get template() {
        return "systems/ewhen/templates/sheets/actor/EWItemSheet.hbs"
    }

    getData () {
        const data = super.getData();

        data.config = CONFIG.ewhen; 
        
        return data;
    }
}