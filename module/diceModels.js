export function getDiceModel (game) {
  const diceType = game.settings.get("ewhen", "diceType")
  return DICE_MODELS[diceType] || DEFAULT_DICE_MODEL
}

export const DICE_MODELS = {
  '2d6': {
    baseDie: 'd6',
    numberOfDice: 2,
    tn: 9,
    failure: 2,
    success: 12,
  },
  '2d10': {
    baseDie: 'd10',
    numberOfDice: 2,
    tn: 13,
    failure: 3,
    success: 19,
  },
  '2d12': {
    baseDie: 'd12',
    numberOfDice: 2,
    tn: 15,
    failure: 3,
    success: 23,
  },
  '3d6': {
    baseDie: 'd6',
    numberOfDice: 3,
    tn: 12,
    failure: 4,
    success: 17,
  },
}
export const DEFAULT_DICE_MODEL = DICE_MODELS["2d6"]
