export default class EWWeaponSheet extends ItemSheet {

    get template() {
        return "systems/ewhen/templates/item/EWWeaponSheet.hbs"
    }

    getData () {
        const data = super.getData();

        data.config = CONFIG.ewhen; 
        
        return data;
    }
}