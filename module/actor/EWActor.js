export class EWActor extends Actor {



    prepareData() {
        super.prepareData();

    }

    //@override
    prepareBaseData() {

        super.prepareBaseData();

        const actorData = this.data;
        const data = actorData.data;
        const flags = actorData.flags;

        if(actorData.type === 'character') this._prepareCharData(actorData);
        else if (actorData.type === 'vehicle') this._prepareVehicleData(actorData);
    }

    _prepareCharData(actorData) {

       /*  super.prepareDerivedData();
        const data = actorData.data;

        // Lifeblood
        let charStr = data.attributes.strength.rank;
        let lfb = 10 + charStr;
        
        //Resolve
        let charMnd = data.attributes.mind.rank;
        let rsv = 10 + charMnd;

        setProperty(actorData, "data.resrouces.lifeblood", (data.resources.lifeblood = lfb));
        setProperty(actorData, "data.resources.resolve", (data.resources.resolve = rsv)); */
    }

    _prepareVehicleData(actorData){}

}