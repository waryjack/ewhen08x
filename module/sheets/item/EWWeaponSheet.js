export default class EWWeaponSheet extends ItemSheet {

    get template() {
        return "systems/ewhen/templates/item/EWWeaponSheet.hbs"
    }

    getData () {
        const data = this.data;
        console.warn("New Item Data: ", data);

        data.config = CONFIG.ewhen; 
        
        return data;
    }
}