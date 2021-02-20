export default class EWArmorSheet extends ItemSheet {

    /**
     * Armor has the following characteristics
     * Name
     * Type ("none", "light", etc.)
     * Protection: either a die roll or a fixed value
     * Attribute bonus if equipped (e.g. +1 defense)
     * Attribute penalty if equipped (e.g. -1 agility)
     * Difficulty increases (e.g. 2 steps Social)
     * Accessory: boolean (if true, *add* to the total, don't replace)
     * Equipped: boolean (if true/changed, recalc armor value);
     */

    get template() {
        return "systems/ewhen/templates/item/EWARmorSheet.hbs"
    }

    getData () {
        const data = this.data;
        console.warn("item data: ", data);

        data.config = CONFIG.ewhen; 
        
        return data;
    }
}