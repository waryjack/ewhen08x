export default class EWActorSheet extends ActorSheet {

    get template() {
        return "systems/ewhen/templates/actor/EWActorSheet.hbs"
    }

    
    getData () {
        const data = super.getData();

        console.log(data);

        data.config = CONFIG.ewhen; 
        
        return data;
    }
}