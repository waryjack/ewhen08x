const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export default class EWItemSheetV2 extends HandlebarsApplicationMixin(ItemSheetV2) {

    // Note: Careers have basically just a name and an optional description; but the sheet is needed for item creation;
    
    static DEFAULT_OPTIONS = {
        title:"Item Sheet",
        actions:{
            editImage:this._onEditImage
        },
        form: {
                submitOnChange: true,
                closeOnSubmit: false,
        },
        position:{
            width:500,
            height:400,
            left:120
        },
        tag:"form",
        window:{
            title:"EW.game_term.itemsheet",
            contentClasses:['scrollable','standard-form'],
            resizable:true
        },
    }

    get title() {
        let itemtype = this.document.type;
        return `Everywhen ${game.i18n.localize(this.options.window.title)}: ${game.i18n.localize("EW.sheet.title."+itemtype)}`
    }
    
    static PARTS = {
        header: {
            template: "systems/ewhen/templates/item/itemsheetheader.hbs"
        },
        weapon: {
            template: "systems/ewhen/templates/item/weaponsheet.hbs"
        },
        trait: {
             template: "systems/ewhen/templates/item/traitsheet.hbs"
        },
        armor: {
             template: "systems/ewhen/templates/item/armorsheet.hbs"
        },
        power: {
             template: "systems/ewhen/templates/item/powersheet.hbs"
        },
        career: {
             template: "systems/ewhen/templates/item/careersheet.hbs"
        },
        equipment: {
             template: "systems/ewhen/templates/item/equipmentsheet.hbs"
        },
        pointpool: {
            template: "systems/ewhen/templates/item/pointpoolsheet.hbs"
        }
    }

    /** @override */
    _configureRenderOptions(options){
        super._configureRenderOptions(options);

        options.parts = ['header'];
        if (this.document.limited) return;

        console.log("This Document Type: ", this.document.type);
        switch(this.document.type) {
            case "weapon":
                options.parts.push("weapon");
                break;
            case "trait":
                options.parts.push("trait");
                break;
            case "power":
                options.parts.push("power");
                break;
            case "career":
                options.parts.push("career");
                break;
            case "armor":
                options.parts.push("armor");
                break;
            case "equipment":
                options.parts.push("equipment");
                break;
            case "pointpool":
                options.parts.push("pointpool");
                break;
            default:
        }
        console.log(options.parts);

    }
    
    async _prepareContext(options) {
        console.log("This: ", this);
        let settings = game.settings.get("ewhen","allSettings");
        const context = {
            item: this.item,
            system: this.item.system,
            sys_source: this.item.system._source,
            fields:this.document.schema.fields,
            config:CONFIG.ewhen,
            attOpts: {
                "none":game.i18n.localize("EW.game_term.none"),
                "strength":settings.strName,
                "agility":settings.agiName,
                "mind":settings.minName,
                "appeal":settings.appName
            },
            wtypeOpts: {
                "lightMelee":game.i18n.localize("EW.weapontype.lightmelee"),
                "mediumMelee":game.i18n.localize("EW.weapontype.mediummelee"),
                "heavyMelee":game.i18n.localize("EW.weapontype.heavymelee"),
                "lightRanged":game.i18n.localize("EW.weapontype.lightranged"),
                "mediumRanged":game.i18n.localize("EW.weapontype.mediumranged"),
                "heavyRanged":game.i18n.localize("EW.weapontype.heavyranged"),
            },
            whandOpts: {
                "one":game.i18n.localize("EW.weaponhands.onehanded"),
                "two":game.i18n.localize("EW.weaponhands.twohanded")
            },
            atypeOpts: {
                "light":game.i18n.localize("EW.armortype.light"),
                "medium":game.i18n.localize("EW.armortype.medium"),
                "heavy":game.i18n.localize("EW.armortype.heavy"),
                "complete":game.i18n.localize("EW.armortype.complete"),
                "helmet":game.i18n.localize("EW.armortype.helmet"),
                "small_shield":game.i18n.localize("EW.armortype.small_shield"),
                "large_shield":game.i18n.localize("EW.armortype.large_shield")
            },
            abonusOpts: {
                "none":game.i18n.localize("EW.game_term.none"),
                "strength":settings.strName,
                "agility":settings.agiName,
                "mind":settings.minName,
                "appeal":settings.appName,
                "melee":settings.melName,
                "ranged":settings.ranName,
                "defense":settings.defName,
                "initiative":settings.iniName
            },
            vprotectOpts: {
               "none":game.i18n.localize("EW.game_term.none"),
                "1d3":"d3",
                "1d6-3":"d6-3",
                "1d6-2":"d6-2",
                "1d6-1":"d6-1",
                "1d6":"d6"
            },
            eraOpts: {
    
                "ancient":game.i18n.localize("EW.era.ancient"),
                "steampunk":game.i18n.localize("EW.era.steampunk"),
                "modern":game.i18n.localize("EW.era.modern"),
                "cyberpunk":game.i18n.localize("EW.era.cyberpunk"),
                "future":game.i18n.localize("EW.era.future"),
                "other":game.i18n.localize("EW.era.other")

            },
            dmgDiceOpts: {
                "0":"0",
                "1":"1",
                "1d2":"d2",
                "1d3":"d3",
                "1d3+1":"d3+1",
                "1d6-1":"d6-1",
                "1d6":"d6",
                "1d6+1":"d6+1",
                "1d6+2":"d6+2",
                "1d6+3":"d6+3",
                "2d6kl1":"d6L",
                "2d6kh1":"d6H",
                "3d6kl2":"2d6L",
                "2d6":"2d6",
                "3d6kh2":"2d6H",
                "4d6kl3":"3d6L",
                "3d6":"3d6",
                "4d6kh3":"3d6H"
            },
            traitTypeOpts : {
                "boon":game.i18n.localize("EW.trait.type.boon"),
                "flaw":game.i18n.localize("EW.trait.type.flaw"),
                "power":game.i18n.localize("EW.trait.type.power")
            },
            traitSourceOpts : {
                "normal":game.i18n.localize("EW.trait.source.normal"),
                "origin":game.i18n.localize("EW.trait.source.origin"),
                "augment":game.i18n.localize("EW.trait.source.augment"),
                "supernatural":game.i18n.localize("EW.trait.source.supernatural"),
                "vehicle":game.i18n.localize("EW.trait.source.vehicle"),
                "setting":game.i18n.localize("EW.trait.source.setting"),
                "creature":game.i18n.localize("EW.trait.source.creature"),
                "martial_arts":game.i18n.localize("EW.trait.source.martial_arts"),
                "custom":game.i18n.localize("EW.trait.source.custom")
            },
            traitPriModOpts : {
                "none":game.i18n.localize("EW.game_term.none"),
                "bonus":game.i18n.localize("EW.game_term.bonusdie"),
                "penalty":game.i18n.localize("EW.game_term.penaltydie")
            },
            enrichedDescription: await TextEditor.enrichHTML(this.item.system.description)
        }
        return context;
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