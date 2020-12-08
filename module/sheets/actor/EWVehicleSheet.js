export default class EWVehicleSheet extends ActorSheet {

    get template() {
        return "systems/ewhen/templates/actor/EWVehicleSheet.hbs"
    }

    getData () {
        const data = super.getData();

        data.config = CONFIG.ewhen; 
        
        return data;
    }
}