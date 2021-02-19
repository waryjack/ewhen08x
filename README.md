# Everywhen (Unofficial) Foundry VTT system

## This is the test branch for Foundry 0.8.x development.

This is an unofficial Foundry VTT system for the *Everywhen* RPG from Filigree Forge, based on *Barbarians of Lemuria* written by Simon Washbourne.

The system takes a low-automation approach, with the focus on a character sheet to manage the basics, the unique initiative and damage tracking, and dice rolling. Targeting and automatic damage stuff is not currently implemented (may be a future wishlist item).

# Using the System

## Actor Types
There are two types of Actors in the game: *character* and *vehicle*. 

### Characters
Characters can be toggled to "Tough" or "Rabble", but all of the individual characters (hero, rival, tough, and rabble) share a single sheet, which displays differing information based on type. Character sheets are live, with drag/drop enabled. 

**Note**: currently the "Armor Bonus" field on the miscellaneous details tab *includes* the bonus from equipped accessories, so take that into account if making an adjustment. Future iterations will fix that. 

### Vehicles
Vehicles have one type of sheet; a simple two-pane sheet with vehicle information. All vehicles show a shield track at this point; future updates will allow that to be toggled.

To set the vehicle's frame track, adjust the *Frame* stat in the left-hand pane. Frame tracks always have a minimum value of 5, however.

## Item Types
There are a number of item types:

* Trait: this type is used for boons and flaws
* Career: this type is used for careers; future updates will *probably* fold this into traits
* Power: this type is for arcane / faith / psionic powers, etc.
* Weapon
* Armor
* Equipment: this is for non-weapon / non-armor gear

## Setting Modifiers

For **Items**, bonuses and penalties are factored separately, so use positive numbers for each. 

## Editing Items
Click on the name of the item to open the item editor window. Note: since the only useful info for a Career is its name, they can be edited inline rather than popping up a window.  

# Rolling Dice

## Modifiers
**Note**: The general modifier field accepts both positive and negative numbers. 

## Attribute and General Rolls
Dice rolls can be triggered from the die icon on the character sheet, or by clicking on an attribute or combat attribute. 

## Weapon and Armor Damage
Click on the weapon or armor image in inventory to roll weapon damage or armor protection, respectively. 


# Todo

* Incorporating encumbrance / weight counting
* Weights and costs for weapons and armor (there, but not wired in yet)
* Localization fixes
* Refactoring and cleanup - ugly hacky code.

## Fixes/Issues

* Vehicle sheet image background removal
* Alignment of elements / CSS revisions