export class EWCombat extends Combat {

       
    constructor(...args) {
        super(...args);

        console.log("Combat Turns Array: ", this.turns);
       
    }

    getActorCombatant(actor) {
       //  return this.combatants.find((c) => c.actor._id === actor._id);
    }



    //@override 
    rollInitiative(ids){
        super.rollInitiative(ids);

        
    }

    //@override
    nextRound(){
        if(!game.settings.get("ewhen", "rerollPerRound")) { return; }
        super.nextRound();
        let rrlist = new Array();

        for (let c of this.combatants) {
            rrlist.push(c._id);
        }

        this.rollInitiative(rrlist);
    }

    static convertInitiative(com) {

        var adjInit = 0;
        var isPC;
        console.log("Combatant in convertInit: ", com);
        var snakeEyes = false;
        var boxCars = false;
        let initRoll = com.initiative;
        let actorId = com.actor.data._id;
        let actor = game.actors.get(actorId);
        let name = actor.name;
        let isRival = actor.data.data.isRival;
        let isTough = actor.data.data.isTough;
        let isRabble = actor.data.data.isRabble;
        
        if(!isRival && !isTough && !isRabble) { isPC = true; } else { isPC = false; }

        let mnd = actor.getAttribute("mind").rank;
        let ini = actor.getAttribute("initiative").rank;
        let diceOnly = initRoll - mnd - ini;

        if (diceOnly == 12) { boxCars = true; }
        if (diceOnly == 2) { snakeEyes = true;}

        if(!isPC){
        // todo - work on Rivals with "Diabolical Plan" feat;
            if (isRival) { adjInit = 5; }
            if (isTough) { adjInit = 4; }
            if (isRabble) { adjInit = 2; }
            
        }

        console.log(name, " isPC: ", isPC);;

        if (isPC) {
            if(boxCars) {
                // mighty success; initiative = 8
                adjInit = 8;
            } else if (initRoll >= 9 && diceOnly < 12 && diceOnly > 2) { 
                // regular success; initiative = 6
                adjInit = 6;
            } else if (initRoll < 9 && diceOnly < 12 && diceOnly > 2) {
                // regular failure; initiative = 3
                adjInit = 3;
            } else if (snakeEyes) {
                // calam failure, initiative = 1
                adjInit = 1;
            }
        }

       return adjInit;


    }

    prioritySort(turns) {

        //  let turns = this.turns;

    // console.log("Preupdate Combat Object: ", combat);

    for(let i=0; i<turns.length; i++){
        var adjInit = 0;
        var isPC;
        var turn = turns[i];
        console.log("turn ", turn);
        var snakeEyes = false;
        var boxCars = false;
        let initRoll = turn.initiative;
        let actorId = turn.actor._id;
        let actor = game.actors.get(actorId);
        let name = actor.name;
        let isRival = actor.data.data.isRival;
        let isTough = actor.data.data.isTough;
        let isRabble = actor.data.data.isRabble;
        
        if(!isRival && !isTough && !isRabble) { isPC = true; } else { isPC = false; }

        let mnd = actor.getAttribute("mind").rank;
        let ini = actor.getAttribute("initiative").rank;
        let diceOnly = initRoll - mnd - ini;


      
        if (diceOnly == 12) { boxCars = true; }
        if (diceOnly == 2) { snakeEyes = true;}

        if(!isPC){
        // todo - work on Rivals with "Diabolical Plan" feat;
            if (isRival) { adjInit = 5; }
            if (isTough) { adjInit = 4; }
            if (isRabble) { adjInit = 2; }
            
        }

   //     console.log(actor.name, " isPC: ", isPC);;

        if (isPC) {
            if(boxCars) {
                // mighty success; initiative = 8
                adjInit = 8;
            } else if (initRoll >= 9 && diceOnly < 12 && diceOnly > 2) { 
                // regular success; initiative = 6
                adjInit = 6;
            } else if (initRoll < 9 && diceOnly < 12 && diceOnly > 2) {
                // regular failure; initiative = 3
                adjInit = 3;
            } else if (snakeEyes) {
                // calam failure, initiative = 1
                adjInit = 1;
            }
        }

        console.log("Stuff: ", name, initRoll, adjInit, mnd, ini, diceOnly);

        turn.initiative = adjInit;

        turns[i] = turn;

     
    }

    turns.sort((a, b) => { return b.initiative - a.initiative; });

    
   // console.log("Turns after init sort: ", turns);

    this.update({"turns": turns});



    }



}


