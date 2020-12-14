export default class EWCareerSheet extends ItemSheet {

    // Careers have basically just a name and an optional description; but the sheet is needed for item creation; 
    
    get template() {
        return "systems/ewhen/templates/item/EWCareerSheet.hbs"
    }

    getData () {
        const data = super.getData();

        data.config = CONFIG.ewhen; 
        
        return data;
    }
}