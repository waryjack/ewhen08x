import { EWRoll } from "../roll/EWRoll.js";
import { EWDialogHelper } from "../interaction/EWDialogHelper.js";
import { getDiceModel } from "../diceModels.js";

export class EWActor extends Actor {

  mainAttributes = {
      STRENGTH: "strength",
      AGILITY: "agility",
      MIND: "mind",
      APPEAL: "appeal",
  }

  combatAttributes = {
      MELEE: "melee",
      RANGED: "ranged",
      DEFENSE: "defense",
      INITIATIVE: "initiative"
  }


  /**
   * @override
   */

  prepareBaseData(){
        super.prepareBaseData();

        const actorData = this.system; // actorData is "actor.data.data"

       // console.warn("prepareBaseData object: ", actorData);
        // const data = actorData.data;
        // const flags = actorData.flags;
        console.warn("Actor Object: ", this);
        if (this.type === 'character') {
            this._prepareCharacterData(actorData);
        } else if (this.type === 'vehicle') {
            this._prepareVehicleData(actorData);
        }
    }

    /**
    * @param actorData {EWActor} - this EWActor object's system-specific data
    */
    _prepareCharacterData(actorData) {
        super.prepareDerivedData();

        const data = actorData;
        console.warn("PrepareCharacterData data object: ", data);

        var str = data.main_attributes.strength.rank;
        var mnd = data.main_attributes.mind.rank;
        var mlf = data.resources.lifeblood.misc_lfb;
        var mre = data.resources.resolve.misc_res;

        // console.warn("MRes: ", mre);
        // Initialize derived traits - lifeblood and resolve
        // but not for rabble or toughs!
        console.warn("Rabble? ", data.isRabble, " Tough? ", data.isTough);
        if (!data.isRabble && !data.isTough){
            setProperty(actorData, 'resources.lifeblood.max', Number(str) + 10 + mlf);
            setProperty(actorData, 'resources.resolve.max', Number(mnd) + 10 + mre);
        }

        if (data.isRabble) {
            setProperty(actorData, 'resources.lifeblood.max', game.settings.get('ewhen', 'rabbleStrength'));
            setProperty(actorData, 'resources.resolve.max', game.settings.get('ewhen', 'rabbleStrength'));
        }

        if (data.isTough) {
            setProperty(actorData, 'resources.lifeblood.max', Number(str)+5);
            setProperty(actorData, 'resources.resolve.max', Number(mnd)+5);
        }

        let totalLbd = data.resources.lifeblood.regular + data.resources.lifeblood.lasting + data.resources.lifeblood.fatigue;
        let totalRsd = data.resources.resolve.regular + data.resources.resolve.lasting + data.resources.resolve.fatigue;

        setProperty(actorData, 'resources.lifeblood.value', Math.max(0, data.resources.lifeblood.max - totalLbd));

        setProperty(actorData, 'resources.resolve.value', Math.max(0, data.resources.resolve.max - totalRsd));

        // Calculate priority roll expression based on base info and misc BD/PD bonuses

        setProperty(actorData, 'data.priority_roll', this.setPriorityRoll());
    }

    _prepareVehicleData(actorData) {
        // Stub
        super.prepareDerivedData();
        const data = actorData;
        console.warn("vehicle data", data);

        var frame = data.frame.rank;
        var lasting = data.frame.lasting;
        var shieldDmg = data.resources.shield.lasting + data.resources.shield.regular + data.resources.shield.fatigue;

        setProperty(actorData, "frame.max", Math.max(5, frame));
        setProperty(actorData, "frame.value", Math.max(0, data.frame.max - lasting));
        setProperty(actorData, "resources.shield.max", Math.max(5, frame));
        setProperty(actorData, "resources.shield.value", Math.max(0, data.resources.shield.max - shieldDmg));
    }

    /**
     * Calculate the roll formula for priority rolls based on various character bonuses
     */
    setPriorityRoll() {
        const diceModel = getDiceModel(game)
        const priority = duplicate(this.system.priority_roll);
        let netExtraDice = priority.bd - priority.pd;
        let numberOfDice = diceModel.numberOfDice;
        let baseDie = diceModel.baseDie;

        // If using H+I or BoL compatible initiative - uses just a single D6
        if(game.settings.get("ewhen", "singleDieInit")) {
            numberOfDice = 1;
            baseDie = "d6";
        }

        const newSuffix = netExtraDice < 0 ? `kl${numberOfDice}` : `kh${numberOfDice}`;
        console.warn("net extra dice: ", netExtraDice);

        let finalFormula = (Number(numberOfDice) + Math.abs(netExtraDice)) + baseDie + newSuffix + "+" + priority.miscMod;

        priority.expression = finalFormula;

        console.warn("Priority Final Expression: ", finalFormula);

        return priority;

    }
    /**
    * Generate a basic Everywhen dice roll
    * Could be refactored out to its own class eventually
    * it's here for easy access to attributes
    */

   basicRoll() {
        const pri = duplicate(this.system.main_attributes);
        const com = duplicate(this.system.combat_attributes);
        const car = this.items.filter(function(item) {return item.type == "career"});

        let dialogData = {
            primary: pri,
            combat: com,
            careers: car,
            attr: "",
            isCombat: false,
            actor:this,
            item:{}
        }

        EWDialogHelper.generateRollDialog(CONFIG.ewhen.DIALOG_TYPE.TASK, dialogData);

    }

    /**
    * @param res {String} - the name of the resource being updated (lifeblood or resolve)
    */
    updateResource(res, html) {
        const resData = deepClone(this.system.resources[res]);
        console.warn("Actor Pre: ", this);
        console.warn("ResData Pre: ", resData);

        const type = this.type;
        var totalDmg = 0;

        if (type == "character") {

            let fatDmg = Number(html.find("#fatigue-dmg").val());
            let regDmg = Number(html.find("#regular-dmg").val());
            let lastDmg = Number(html.find("#lasting-dmg").val());
            let critDmg = Number(html.find("#crit-dmg").val());

            resData.regular = regDmg;
            resData.fatigue = fatDmg;
            resData.lasting = lastDmg;
            resData.critical = Math.min(critDmg, 5);
            totalDmg = regDmg + fatDmg + lastDmg;
            let currentLb = resData.max - totalDmg;
            resData.value = currentLb;


            console.warn("Resdata post: ", resData);
            console.warn("Total Damage: ", totalDmg);

                if(totalDmg > resData.max) {
                    ui.notifications.error(game.i18n.localize("EW.warnings.damageoverrun"));
                } else {

                   let field = `system.resources.${res}`;
                   console.warn(field);
                   this.update({[field]: resData});
                   // setProperty(this, `data.data.resources.${res}`, resData);
                   // this.sheet.render(true);
                }

        } else {

           ui.notifications.warn("Not a character");
           return;

        }


        // console.log("ResData after math (current,reg,fat,last): ", resData.current, resData.regular, resData.fatigue, resData.lasting);

    }

    updateFrame(html) {
        console.warn("Called UpdateFrame");
        // const actorData = duplicate(this.data);
        const resData = deepClone(this.system.frame);
        var totalDmg = 0;



            let lastDmg = Number(html.find("#lasting-dmg").val());
            let critDmg = Number(html.find("#crit-dmg").val());

            resData.lasting = lastDmg;
            resData.critical = Math.min(critDmg, 5);
            totalDmg = lastDmg;
            let currentLb = resData.max - totalDmg;
            resData.value = currentLb;

                if(totalDmg > resData.max) {
                    ui.notifications.error(game.i18n.localize("EW.warnings.damageoverrun"));
                } else {
                    this.update({ "system.frame": resData });

                }

    }

    updateShield(html) {
        console.warn("Called UpdateShields");

        const resData = deepClone(this.system.resources.shield);
        var totalDmg = 0;

            let fatDmg = Number(html.find("#fatigue-dmg").val());
            let regDmg = Number(html.find("#regular-dmg").val());
            let lastDmg = Number(html.find("#lasting-dmg").val());


            resData.regular = regDmg;
            resData.fatigue = fatDmg;
            resData.lasting = lastDmg;

            totalDmg = regDmg + fatDmg + lastDmg;
            let currentLb = resData.max - totalDmg;
            resData.value = currentLb;

                if(totalDmg > resData.max) {
                    ui.notifications.error(game.i18n.localize("EW.warnings.damageoverrun"));
                } else {


                    //  console.log("Actor Data post-update: ", actorData);

                    this.update({ "system.resources.shield" : resData} );

                }

    }

    /**
    * @param attr {String} - the main attribute in the roll (e.g., "strength")
    * @param attr2 {String} - the combat attribute (e.g., "melee")
    * @param isCombat {Boolean} - if the player clicked on the combat attribute
    *                             then assume this is a combat roll; isCombat = true
    * @optStr {String} - the id of an associated item used, or "" if none
    */

    rollAttribute(attr, attr2, isCombat, optStr){

        const ma = duplicate(this.system.main_attributes);
        const ca = duplicate(this.system.combat_attributes);
        const cr = duplicate(this.items.filter(function(item) {return item.type == "career"}));

        var item = null;
        var itemImg = "";
        var itemName = "";
        var isWeapon = false;

        if(optStr != "") {
            item = this.actor.items.get(optStr);
            itemImg = item.img;
            itemName = item.name;
            isWeapon = true;
        }

        let dialogData = {
            primary: ma,
            combat: ca,
            careers: cr,
            attr: attr,
            attr2: attr2,
            isCombat: isCombat,
            isWeapon: isWeapon,
            itemImg: itemImg,
            itemName: itemName,
            item: {},
            actor:this

        }

        EWDialogHelper.generateRollDialog(CONFIG.ewhen.DIALOG_TYPE.TASK, dialogData);


    }

    /**
    * @param weapon {Item} - the Item object for the weapon in use
    */
    rollWeaponDamage(weapon) {

        let weaponData = weapon.system;

        var baseExpr;
        var addAttr = "none";
        var half;
        var miscMod = 0;
        var attRank = 0;



        let weaponDamage = weaponData.damage;
        let wName = weapon.name;
        let wImg = weapon.img;
        let range = weaponData.range;

        baseExpr = weaponDamage.dice;
        addAttr = weaponDamage.add_attribute;
        half = weaponDamage.half_attribute;
        miscMod = weaponDamage.mod;

        console.warn("Added Attribute: ", addAttr);

        if (addAttr != "none") {
            attRank = this.data.data.main_attributes[addAttr].rank;
        } else {
            attRank = 0
        }

        console.warn("Added Rank: ", attRank);

        let attMod = half ? Math.floor(attRank/2) : attRank;

        let finalExpr = baseExpr + "+" + attMod + "+" + miscMod;

        console.warn("Final Attmod: ", attMod, baseExpr, finalExpr);

        let dialogData = {
            wname: wName,
            wimg: wImg,
            range: range,
            baseExpr: baseExpr,
            attName: addAttr,
            half:half,
            attMod: attMod,
            miscMod: miscMod,
            finalExpr: finalExpr,
            item:weapon,
            actor:this
        }

        EWDialogHelper.generateRollDialog(CONFIG.ewhen.DIALOG_TYPE.DAMAGE, dialogData);


    }

    /**
     * @param armor - the armor object being rolled
     */
    rollArmor(armor) {

        let armorData = armor.system;
        let expr = armorData.protection.variable;
        let img = armor.img;
        let name = armor.name;

        //Bail out if it's a shield or helmet; those don't get rolled
        if(armorData.accessory) return;

        let rData = {
            html: "",
            actor:this,
            isDamage:false,
            item: armor
        }

        let armorRoll = new EWRoll(rData);
        armorRoll.rollDice();

        armorRoll.rollObj.getTooltip().then((tt) => armorRoll.createArmorMessage(tt));

    }

    /**
     * Adjusts current lifeblood to match the maximum lifeblood, so it's rendered correctly on the sheet
     * @param {String} res - the resource being changed
     */
    adjustResource(res) {
        const data = this.system;

        if (res == "frame") {
            let dmgSum = data.frame.lasting;
            let adjustedResource = data.frame.max - dmgSum;
            setProperty(this, "system.frame.value", adjustedResource);

        } else {
            let dmgSum = data.resources[res].regular + data.resources[res].lasting + data.resources[res].fatigue;

            console.log("DmgSum: ", dmgSum);
            console.log("Max: ", data.resources[res].max);
            console.log("Value: ", data.resources[res].value);

            let adjustedResource = data.resources[res].max - dmgSum;


            console.log("Value after: ", adjustedResource);

            this.data.data.resources[res].value = adjustedResource;
            console.log("Actor updated or not? ", this);

            setProperty(this, `system.resources.${res}.value`, adjustedResource);
        }
    }

    spendHeroPoint() {
        const hp = this.system.resources.hero_points;
        if(hp == 0) { ui.notifications.error(game.i18n.localize("EW.warnings.noHeroPoints")); return; }
        let newHp= Math.max(0, hp - 1);
        console.log("HP / NewHP: ", hp, newHp);
        this.update({"system.resources.hero_points": newHp});

        let chatData = {
            actor:this.name
        }

        renderTemplate('systems/ewhen/templates/roll/EWHeroPoint.hbs', chatData).then((msg)=>{
            ChatMessage.create({
                user: game.user._id,
                type:CONST.CHAT_MESSAGE_TYPES.ROLL,
                speaker: ChatMessage.getSpeaker(),
                content: msg
            });



        });

    }

    /**
     * Handles updating or removing modifiers derived from traits; considering whether this should not
     * just be manual even for initiative
     *
     * @param {Item} item - the trait being handled
     * @param {String} action - whether to update (overwrite) or remove the modifier - this is where it's tricky
     */

    applyRemoveTraitModifier (item, action) {

        if(item.type == "trait") {
            const diceModel = getDiceModel(game)

            let type = item.type;
            let pmod = item.system.priority_dieMod;
            const adata = duplicate(this.system.priority_roll);


            if(pmod == "bonus") {
                // expression is: 3d6kh2 for 2d6, 3d12kh2 for 2d12, 4d6kh3 for 3d6
                adata.expression = `${diceModel.numberOfDice + 1}${diceModel.baseDie}kh${diceModel.numberOfDice}`;
            } else if (type == "trait" && pmod == "penalty") {
                adata.expression = `${diceModel.numberOfDice + 1}${diceModel.baseDie}kl${diceModel.numberOfDice}`;
            }

            actor.update({ "system.priority_roll": adata});
        }

    }

    /**
     * Handle equipping or unequipping items like armor and shields, and
     * applying necessary modifiers.
     * @param {Item} item - the item being equipped or unequipped
     * @param {Boolean} equip - if true, the item is being equipped; if false, it's being removed
     */

    equipItem(item, equip) {
        const ma = ["strength", "agility", "mind", "appeal"];
        const ca = ["melee", "ranged", "defense", "initiative"];



        if(item.type == "armor" && ("equipped" in changed.data)) {

            var bonusIsMain;
            var penaltyIsMain;
            const armData = item.data;
            const actorData = duplicate(actor.system);
            let equipped = armData.equipped;
            let fixed = armData.protection.fixed;
            let vbl = armData.protection.variable;
            let isAccessory = armData.accessory;
            let bAttrib = armData.bonus.to;
            let bVal = armData.bonus.amount;
            let pAttrib = armData.penalty.to;
            let pVal = armData.penalty.amount;


            console.log("actor data", actorData);
            console.log("bAttrib / val: ", bAttrib, bVal);
            console.log("pAttrib / val: ", pAttrib, pVal);

            if(equipped) {
                if(bAttrib != "none" && ma.includes(bAttrib)) {
                    actorData.main_attributes[bAttrib].rank += bVal;
                } else if (bAttrib != "none" && ca.includes(bAttrib)) {
                    actorData.combat_attributes[bAttrib].rank += bVal;
                }
                if(pAttrib != "none" && ma.includes(pAttrib)) {
                    actorData.main_attributes[pAttrib].rank -= pVal;
                } else if (pAttrib != "none" && ca.includes(pAttrib)) {
                    actorData.combat_attributes[pAttrib].rank -= pVal;
                }
                if(isAccessory){
                    actorData.armorbonus += fixed;
                    console.log("Actor armor bonus: ", actorData.armorbonus);
                }
            }
            if(!equipped) {
                if(bAttrib != "none" && ma.includes(bAttrib)) {
                    actorData.main_attributes[bAttrib].rank -= bVal;
                } else if (bAttrib != "none" && ca.includes(bAttrib)) {
                    actorData.combat_attributes[bAttrib].rank -= bVal;
                }
                if(pAttrib != "none" && ma.includes(pAttrib)) {
                    actorData.main_attributes[pAttrib].rank += pVal;
                } else if (pAttrib != "none" && ca.includes(pAttrib)) {
                    actorData.combat_attributes[pAttrib].rank += pVal;
                }
                if(isAccessory) {
                    actorData.armorbonus = Math.max(0, actorData.armorbonus - fixed);
                    console.log("Actor armor bonus: ", actorData.armorbonus);
                }
            }

            actor.update({ "system": actorData});

        }
    }

    //getters
    getAttribute(attribute){
        var attSet;
        Object.values(this.mainAttributes).includes(attribute) ? attSet="main_attributes" : attSet = "combat_attributes";
        return this.system[attSet][attribute];
    }

    getLifeblood() {
        return this.system.resources.lifeblood;
    }

    getResolve() {
        return this.system.resources.resolve;
    }

    getHeroPoints() {
        return this.system.resources.hero_points;
    }

    getArcanaPoints() {
        return this.system.resources.arcana_points;
    }

    getFaithPoints() {
        return this.system.resources.faith_points;
    }

    getPsiPoints() {
        return this.system.resources.psi_points;
    }

    get isTough() {
        return this.system.isTough;
    }

    get isRabble() {
        return this.system.isRabble;
    }

    get isCreature() {
        return this.system.isCreature;
    }

    get isEntity() {
        return this.system.isEntity;
    }

    get isNPC() {
        return this.system.isNPC;
    }

    get size() {
        return this.system.size;
    }
}

