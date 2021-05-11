export const EW = {

    main_attributes: {

        strength: 'EW.attributes.primary.strength',
        agility: 'EW.attributes.primary.agility',
        mind: 'EW.attributes.primary.mind',
        appeal: 'EW.attributes.primary.appeal'
    },
    combat_attributes: {
        melee: 'EW.attributes.combat.melee',
        ranged: 'EW.attributes.combat.ranged',
        defense: 'EW.attributes.combat.defense',
        initiative: 'EW.attributes.combat.initiative'
    },
    vehicle_attributes: {
        type: 'EW.attributes.vehicle.type',
        crew: 'EW.attributes.vehicle.crew',
        scan: 'EW.attributes.vehicle.scan',
        speed: 'EW.attributes.vehicle.speed',
        defense: 'EW.attributes.vehicle.defense',
        frame: 'EW.attributes.vehicle.frame',
        armor: 'EW.attributes.vehicle.armor'
    },
    sizes: {
        tiny: "EW.creature.size.tiny",
        small: "EW.creature.size.small",
        medium: "EW.creature.size.medium",
        large: "EW.creature.size.large",
        huge: "EW.creature.size.huge",
        enormous: "EW.creature.size.enormous"
    },
    game_terms: {
        attributes: 'EW.game_term.attributes',
        boons: 'EW.game_term.boons',
        flaws: 'EW.game_term.flaws',
        powers: 'EW.game_term.powers',
        rank: 'EW.game_term.rank',
        scale: 'EW.game_term.scale',
        careers: 'EW.game_term.careers',
        trait_type: 'EW.game_term.trait_type',
        trait_source: 'EW.game_term.trait_source'
    },
    resource_attributes: {
        lifeblood: 'EW.attributes.resource.lifeblood',
        critical: 'EW.attributes.resource.critical',
        resolve: 'EW.attributes.resource.resolve',
        hero_points: 'EW.attributes.resource.hero_points',
        faith_points: 'EW.attributes.resource.faith_points',
        psi_points: 'EW.attributes.resource.psi_points',
        arcana_points: 'EW.attributes.resource.arcana_points',
        credit_rating: 'EW.attributes.resource.credit_rating'
    },
    damageTypes: {
        fatigue:'EW.damage.type.fatigue',
        normal:'EW.damage.type.normal',
        lasting:'EW.damage.type.lasting'
    },
    powerTypes: {
        arcane:'EW.power.arcane',
        psionic:'EW.power.psionic',
        faith:'EW.power.faith',
        superhero:'EW.power.superhero',
        martialarts:'EW.power.martialarts'
    },
    traitSources: {
        normal:'EW.trait.source.normal',
        origin:'EW.trait.source.origin',
        augment:'EW.trait.source.augment',
        supernatural:'EW.trait.source.supernatural',
        vehicle:'EW.trait.source.vehicle',
        setting:'EW.trait.source.setting',
        creature:'EW.trait.source.creature',
        martial_arts:'EW.trait.source.martial_arts',
        custom: 'EW.trait.source.custom',
    },
    traitTypes: {
        boon: 'EW.trait.type.boon',
        flaw: 'EW.trait.type.flaw',
        power: 'EW.trait.type.power'
    },
    creatureSizes: {
        tiny: 'EW.creature.size.tiny',
        small: 'EW.creature.size.small',
        medium: 'EW.creature.size.medium',
        large: 'EW.creature.size.large',
        huge: 'EW.creature.size.huge',
        enormous: 'EW.creature.size.enormous'
    },
    intelligent_entityTypes: {
        critter: 'EW.entity.type.critter',
        minor:'EW.entity.type.minor',
        lesser:'EW.entity.type.lesser',
        greater:'EW.entity.type.greater'
    },
    weapon_types: {
        lightMelee: 'EW.weapontype.lightmelee',
        mediumMelee: 'EW.weapontype.mediummelee',
        heavyMelee: 'EW.weapontype.heavymelee',
        lightRanged: 'EW.weapontype.lightranged',
        mediumRanged: 'EW.weapontype.mediumranged',
        heavyRanged: 'EW.weapontype.heavyranged'
    },
    weapon_hands: {
        one: 'EW.weaponhands.onehanded',
        two: 'EW.weaponhands.twohanded'
    },
    era: {
        ancient: 'EW.eras.ancient',
        steampunk: "EW.era.steampunk",
        modern: "EW.era.modern",
        cyberpunk: "EW.era.cyberpunk",
        future: "EW.era.future",
        other: "EW.era.other"
    },
    armor_types: {
        light: 'EW.armortype.light',
        medium: 'EW.armortype.medium',
        heavy: 'EW.armortype.heavy',
        complete: 'EW.armortype.complete',
        helmet: 'EW.armortype.helmet',
        small_shield: 'EW.armortype.small_shield',
        large_shield: 'EW.armortype.large_shield'
    },
    magnitudes: {
        cantrip: 'EW.power.magnitude.cantrip',
        first: 'EW.power.magnitude.first',
        second: 'EW.power.magnitude.second',
        third: 'EW.power.magnitude.third'
    },
    difficulty: {
        very_easy: 'EW.difficulty.very_easy',
        easy: 'EW.difficulty.easy',
        moderate: 'EW.difficulty.moderate',
        hard: 'EW.difficulty.hard',
        tough: 'EW.difficulty.tough',
        demanding: 'EW.difficulty.demanding',
        formidable: 'EW.difficulty.formidable',
        heroic: 'EW.difficulty.heroic'
    },
    MESSAGE_TYPE: {
        TASK: "systems/ewhen/templates/roll/EWRollMessage.hbs",
        DAMAGE: "systems/ewhen/templates/roll/EWDamageMessage.hbs",
        ARMOR: "systems/ewhen/templates/roll/EWArmorMessage.hbs",
        HEROPOINT: "systems/ewhen/templates/roll/EWHeroPoint.hbs"
    },
    DIALOG_TYPE: {
        TASK: "systems/ewhen/templates/roll/EWBasicRoll.hbs",
        DAMAGE: "systems/ewhen/templates/roll/EWDamageRoll.hbs",
        ARMOR: "systems/ewhen/templates/roll/EWArmorRoll.hbs",
        RESOURCE_UPDATE: "systems/ewhen/templates/actor/EWAdjustResource.hbs",
        VEHICLE_RESOURCE_UPDATE: "systems/ewhen/templates/actor/EWAdjustVehicleResource.hbs"
    }

}