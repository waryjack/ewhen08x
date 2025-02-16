
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;
import EWBaseActor from "../../documents/actor/baseactor.mjs"

export default class EWRabbleSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {


    /**
     * @override
     */

    static DEFAULT_OPTIONS = {
        title:"Character Sheet",
        actions:{
            addCareer: this._addCareer,
            deleteCareer: this._deleteCareer,
            adjustResource: this._adjustResource,
            rollDamage: this._rollDamage,
            editImage: this._onEditImage,
            statRoll: this._statRoll
        },
        form: {
                submitOnChange: true,
                closeOnSubmit: false,
        },
        position:{
            width:800,
            height:700,
            left:120
        },
        tag:"form",
        window:{
            title:"EW.game_term.charactersheet",
            contentClasses:['scrollable'],
            resizable:true
        },
        //dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    }

    
    static PARTS = {
        form: {
            template: "systems/ewhen/templates/actor/rabble.hbs",
            scrollable: ['scrollable']
        }
    }

    /**
     * @override
     */
    _prepareContext() {
        const data = foundry.utils.deepClone(this.actor.system);
     
        data.config = CONFIG.ewhen; 
        data.actor = this.actor;
        data.gameSettings = game.settings.get("ewhen", "allSettings");

        // // console.warn("Owned Items: ", ownedItems);
        
        data.careers = this.actor.system.careers;
        data.ckeys = Object.keys(data.careers);
        
        data.isMajor = false;
       
        return data;
    }

    get title() {

        return `Everywhen ${game.i18n.localize(this.options.window.title)}: ${game.i18n.localize("EW.sheet.title."+this.actor.type)}`;
    }

    /**
     * @override
     */
    activateListeners() {
        const html = $(this.element);
        super.activateListeners(html);
        // Everything below here is only needed if the sheet is editable
        

    }

    static async _statRoll(event,element) {
        console.log("In actorsheet method statRoll");
        event.preventDefault();
        let chosenStat = element.dataset.attribute;
        let statId = element.dataset?.statId ?? "";
        await this.actor._statRoll(chosenStat, statId);
    }

    static async _addCareer(event, element) {
        await this.actor._addCareer();
    }

    static async _deleteCareer(event, element) {
        event.preventDefault();
        console.log("Element: ", element.dataset)
        let career = element.dataset.career;
        let id = element.dataset.careerId;
        return this.actor._deleteCareer(career, id);
    }

    static async _rollDamage(event,element) {
        event.preventDefault();
        await this.actor._rollRabbleDamage()
    }

    // Handle changes to the lifeblood/resolve and critical tracks
    static _adjustResource(event,element) {
        event.preventDefault();
        let res = element.dataset.resourceName;
        return this.actor._adjustResource(res);
    }

    static async _onEditImage(_event, target) {
    if (target.nodeName !== "IMG") {
        throw new Error("The editImage action is available only for IMG elements.");
    }
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document._source, attr);
    const defaultArtwork = this.document.constructor.getDefaultArtwork?.(this.document._source) ?? {};
    const defaultImage = foundry.utils.getProperty(defaultArtwork, attr);
    const fp = new FilePicker({
        current,
        type: "image",
        redirectToRoot: defaultImage ? [defaultImage] : [],
        callback: path => {
        target.src = path;
        if (this.options.form.submitOnChange) {
            const submit = new Event("submit");
            this.element.dispatchEvent(submit);
        }
        },
        top: this.position.top + 40,
        left: this.position.left + 10
    });
    await fp.browse();
    }
}