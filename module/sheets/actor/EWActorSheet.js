export default class EWActorSheet extends ActorSheet {

    get template() {
        return "systems/ewhen/templates/actor/EWActorSheet.hbs"
    }

    //Override
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "essentials"}],
        });
      }
    

    getData () {
        const data = super.getData();

        console.log(data);

        data.config = CONFIG.ewhen; 
        
        return data;
    }
}