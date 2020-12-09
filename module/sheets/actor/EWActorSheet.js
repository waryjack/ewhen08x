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

    // @override
    activateListeners(html) {
        super.activateListeners(html);
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        html.find('.edit-career').click(this._editCareer.bind(this));
    }


    _editCareer(event) {
        event.preventDefault();
        const dataset = event.currentTarget;
        console.log(dataset);
        // console.log('alienrpgActorSheet -> _inlineedit -> dataset', dataset);
      }


}