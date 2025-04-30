let turn_count = 1

let game_won = false

let global_stats = {
    population: 13, //total population
    population_food_cost: 0.2, //cost of a pop per turn in food
    free_pop: 0, //population not assigned anywhere
    base_population_cap: 25,
    population_cap: 25, //max pop, once reached any growth will be wasted
    food_per_turn: 0,
    population_growth_cost: 20,
    farming_assigned_pop: 0,
    farming_max_pop: 15,
    hearding_assigned_pop: 0,
    hearding_max_pop: 0,
    fishing_assigned_pop: 0,
    fishing_max_pop: 0,
    temple_assigned_pop: 0,
    temple_max_pop: 0,
    mines_assigned_pop: 0,
    mines_max_pop: 0,
    farming_food_per_pop: 1,
    hearding_food_per_pop: 2,
    fishing_food_per_pop: 4,
    culture_per_pop: 1,
    culture_per_turn: 0,
    production_per_pop: 1,
    production_per_turn: 0,
    base_culture: 2,
    total_culture: 0,
    total_production: 0,
    technology_points: 0,
    technology_culture_cost: 10,
    army_strength: 0,
    enemy_strength: 0,
    researched_technologies: []
}

let global_modifiers = {
    population_cap_modifier: 1.0,
    food_modifier: 1.0,
    food_cost_modifier: 1.0,
    culture_modifier: 1.0,
    tech_cost_modifier: 1.05,
    production_modifier: 1.0,
    army_strength_modifier: 1.0
}

const buildings = [
    {
        name: "Housing",
        base_cost: 25,
        cost: 25,
        population_cap: 10,
        level: 0,
        max_level: 0,
        effect: () => {
            that = buildings[0]
            global_stats.base_population_cap += Math.floor(that.population_cap + that.population_cap * that.level)
            updatePopCap()
        }
    },
    {
        name: "Expanded farms",
        base_cost: 50,
        cost: 50,
        farming_max_pop: 15,
        level: 0,
        max_level: 0,
        effect: () => {
            that = buildings[1]
            global_stats.farming_max_pop += Math.floor(that.farming_max_pop + that.farming_max_pop * that.level * 0.5)
        }
    },
    {
        name: "Hearding pen",
        base_cost: 50,
        cost: 50,
        hearding_max_pop: 5,
        level: 0,
        max_level: 0,
        effect: () => {
            that = buildings[2]
            global_stats.hearding_max_pop += Math.floor(that.hearding_max_pop + that.hearding_max_pop * that.level * 0.5)
        }
    },
    {
        name: "Fishing ward",
        base_cost: 50,
        cost: 50,
        fishing_max_pop: 2,
        level: 0,
        max_level: 0,
        effect: () => {
            that = buildings[3]
            global_stats.fishing_max_pop += Math.floor(that.fishing_max_pop + that.fishing_max_pop * that.level * 0.5)
        }
    },

    {
        name: "Temple",
        base_cost: 100,
        cost: 100,
        temple_max_pop: 10,
        level: 0,
        max_level: 0,
        effect: () => {
            that = buildings[4]
            global_stats.temple_max_pop += Math.floor(that.temple_max_pop + that.temple_max_pop * that.level * 0.5)
        }
    },
    {
        name: "Expanded mines",
        base_cost: 100,
        cost: 100,
        mines_max_pop: 10,
        level: 0,
        max_level: 0,
        effect: () => {
            that = buildings[5]
            global_stats.mines_max_pop += Math.floor(that.mines_max_pop + that.mines_max_pop * that.level * 0.5)
        }
    },
    {
        name: "Armory",
        base_cost: 100,
        cost: 100,
        army_strength_modifier: 0.1,
        level: 0,
        max_level: 0,
        effect: () => {
            that = buildings[6]
            global_modifiers.army_strength_modifier += that.army_strength_modifier
        }
    },
    {
        name: "Metalurgy furnace",
        base_cost: 100,
        cost: 100,
        production_per_pop: 0.1,
        level: 0,
        max_level: 0,
        effect: () => {
            that = buildings[7]
            global_stats.production_per_pop += that.production_per_pop + that.production_per_pop * that.level
            updateProductionPerTurn()
        }
    },
    {
        name: "The Great Wonder",
        base_cost: 10000,
        cost: 10000,
        level: 0,
        max_level: 0,
        effect: () => {
            if (turn_count <= 150) {
                game_won = true
                alert("Congratulations, you have won the game!")
            }
        }
    }
]

const technologies = [
    {
        requirements: [],
        name: "Animal hearding",
        description: "We can intentionally keep animals for food \n +2 max hearding pop",
        effect: () => { global_stats.hearding_max_pop += 2; },
        is_researched: false,
    },
    {
        requirements: [],
        name: "Sky worship",
        description: "Gaze into the strlight sky in awe. \n +2 max temple pop",
        effect: () => { global_stats.temple_max_pop += 2 },
        is_researched: false,
    },
    {
        requirements: [],
        name: "Early stone work",
        description: "Early stone quarrys for building small and simple buildings \n Enables 'Housing' building \n +2 max mines pop",
        effect: () => { buildings[0].max_level += 1, global_stats.mines_max_pop += 2 },
        is_researched: false,
    },
    {
        requirements: ["Early stone work"],
        name: "Simple fishing",
        description: "Working stone and bone tools we can start to fish with simple hooks \n +2 max fishing pop",
        effect: () => { global_stats.fishing_max_pop += 2 },
        is_researched: false,
    },
    {
        requirements: ["Early stone work"],
        name: "Expanded farms",
        description: "Stonework lets us expand our farms and use better tools to feed our population \n Enables 'Expanded farms' building \n +10% food from farming \n +5 max farming pop",
        effect: () => { buildings[1].max_level += 1; global_stats.farming_food_per_pop *= 1.1; global_stats.farming_max_pop += 5; updateFoodPerTurn() },
        is_researched: false,
    },
    {
        requirements: ["Early stone work", "Simple fishing"],
        name: "Fishing wards",
        description: "Advances in woodworking using stone tools to make boats to catch more fish \n Enables 'Fishing ward' building \n +10% food from fishing \n +5 max fishing pop",
        effect: () => { buildings[3].max_level += 1; global_stats.fishing_food_per_pop *= 1.1; global_stats.fishing_max_pop += 5 },
        is_researched: false,
    },
    {
        requirements: ["Early stone work", "Animal hearding"],
        name: "Hearding pens",
        description: "Advances in tool making makes it easy to create pens for hearding animals \n Enables 'Hearding pen' building \n +10% food from hearding \n +5 max hearding pop",
        effect: () => { buildings[2].max_level += 1; global_stats.hearding_food_per_pop *= 1.1; global_stats.hearding_max_pop += 5 },
        is_researched: false,
    },
    {
        requirements: ["Early stone work", "Sky worship"],
        name: "Temple worship",
        description: "The gods will bless our new temples we build in their glory \n Enables 'Temple' building \n +10% culture \n +5 max temple pop",
        effect: () => { buildings[4].max_level += 1; global_stats.culture_per_pop *= 1.1; global_stats.temple_max_pop += 5; updateCulturePerTurn() },
        is_researched: false,
    },
    {
        requirements: ["Early stone work"],
        name: "Expanded mines",
        description: "The gods will bless our new temples we build in their glory \n Enables 'Expanded mines' building \n +10% production \n +5 max mines pop",
        effect: () => { buildings[5].max_level += 1; global_stats.production_per_pop *= 1.1; global_stats.mines_max_pop += 5; updateProductionPerTurn() },
        is_researched: false,
    },
    {
        requirements: ["Early stone work"],
        name: "Expanded housing",
        description: "We will need more space for our growing population \n +1 'Housing' max level",
        effect: () => { buildings[0].max_level += 1 },
        is_researched: false,
    },
    {
        requirements: ["Early stone work"],
        name: "Stone weapons",
        description: "Stone tools to stone weapons, hammers, axes, spears \n Enables 'Armory' building \n +25% army strength",
        effect: () => { global_modifiers.army_strength_modifier += 0.25; buildings[6].max_level += 1; updateFreePops() },
        is_researched: false,
    },

    {
        requirements: ["Expanded housing"],
        name: "Town planning",
        description: "Planning will enable us to utilise our space better \n +15% population cap \n +1 'Housing' max level",
        effect: () => { buildings[0].max_level += 1, global_modifiers.population_cap_modifier *= 1.25; updatePopCap() },
        is_researched: false,
    },
    {
        requirements: ["Early stone work", "Expanded mines", "Expanded housing"],
        name: "Bronze working",
        description: "Bronze tools allow for more efficient production \n Enables 'Metalurgy furnace' building \n +1 max level for all unlocked buildings \n +15% production",
        effect: () => { buildings.forEach(building => { if (building.max_level > 0) { building.max_level += 1 } }), buildings[7].max_level += 1, global_stats.production_per_pop *= 1.15; updateProductionPerTurn() },
        is_researched: false,
    },
    {
        requirements: ["Stone weapons", "Bronze working"],
        name: "Bronze weapons",
        description: "Bronze weapons make our army stronger \n +1 'Armory' max level \n +25% army strength",
        effect: () => { global_modifiers.army_strength_modifier += 0.25; buildings[6].max_level += 1; updateFreePops() },
        is_researched: false,
    },
    {
        requirements: ["Bronze working", "Temple worship"],
        name: "Codified polytheism",
        description: "Continued theology and philosophy unlocks the secrets of the heavens \n +1 'Temple' max level \n +25% culture \n +15 max temple pop",
        effect: () => { buildings[4].max_level += 1; global_stats.culture_per_pop *= 1.25; global_stats.temple_max_pop += 15; updateCulturePerTurn() },
        is_researched: false,
    },
    {
        requirements: ["Bronze working"],
        name: "Developed mining",
        description: "Bronze tools allow us to dig deeper and deeper \n +1 'Expanded mines' max level \n +25% production \n +15 max mines pop",
        effect: () => { buildings[5].max_level += 1; global_stats.production_per_pop *= 1.25; global_stats.mines_max_pop += 15; updateProductionPerTurn() },
        is_researched: false,
    },
    {
        requirements: ["Bronze working", "Expanded farms", "Hearding pens", "Fishing wards"],
        name: "Farming tools",
        description: "Bronze tools allow us to farm, heard and fish more efficiently \n +1 'Expanded farm', 'Hearding pen', 'Fishing ward' max level\n +25% global food modifier",
        effect: () => { buildings[1].max_level += 1; buildings[2].max_level += 1; buildings[3].max_level += 1; global_modifiers.food_modifier *= 1.25; updateFoodPerTurn() },
        is_researched: false,
    },
    {
        requirements: ["Bronze working"],
        name: "City planning",
        description: "Bronze tools allows our architects to better survey and measure the land \n +2 'Housing' max level \n +25% population cap",
        effect: () => { buildings[0].max_level += 2; global_modifiers.population_cap_modifier *= 1.25; updatePopCap() },
        is_researched: false,
    },
    {
        requirements: ["Bronze working", "Developed mining", "City planning"],
        name: "Iron working",
        description: "Iron tools allow for even more efficient production \n +1 max level for all unlocked buildings \n +50% production",
        effect: () => { buildings.forEach(building => { if (building.max_level > 0) { building.max_level += 1 } }); global_stats.production_per_pop *= 1.5; updateProductionPerTurn() },
        is_researched: false,
    },
    {
        requirements: ["Iron working"],
        name: "Advanced mining",
        description: "Iron tools allow us to dig even deeper \n +1 'Expanded mines' max level \n +50% production \n +10% max mines pop",
        effect: () => { buildings[5].max_level += 1; global_stats.production_per_pop *= 1.25; global_stats.mines_max_pop = Math.floor(global_stats.mines_max_pop * 1.1); updateProductionPerTurn() },
        is_researched: false,
    },
    {
        requirements: ["Bronze weapons", "Iron working"],
        name: "Iron weapons",
        description: "Iron weapons will crush any opposition \n +1 'Armory' max level \n +50% army strength",
        effect: () => { global_modifiers.army_strength_modifier += 0.5; buildings[6].max_level += 2; updateFreePops() },
        is_researched: false,
    },
    {
        requirements: ["Iron working", "Codified polytheism"],
        name: "Advanced polytheism",
        description: "Advanced ideas in theology and philosophy unlock all kinds of hidden knowledge \n +1 'Temple' max level \n +50% culture \n +10% max temple pop",
        effect: () => { buildings[4].max_level += 1; global_stats.culture_per_pop *= 1.5; global_stats.temple_max_pop = Math.floor(global_stats.temple_max_pop * 1.1); updateCulturePerTurn() },
        is_researched: false,
    },
    {
        requirements: ["Iron working", "City planning"],
        name: "Advanced architecture",
        description: "Advanced iron tools allow for precise building, allowing us to go even taller \n +2 'Housing' max level \n +50% population cap",
        effect: () => { buildings[0].max_level += 2; global_modifiers.population_cap_modifier *= 1.5; updatePopCap() },
        is_researched: false,
    },
    {
        requirements: ["Advanced architecture"],
        name: "Great wonder of the world",
        description: "All nations will be in awe of our great wonder! \n Enables 'The Great Wonder' building \n +100% production",
        effect: () => { buildings[8].max_level += 1; global_modifiers.production_modifier *= 2; updateProductionPerTurn() },
        is_researched: false,
    },


]
function calculateTurn() {
    turn_count += 1

    if (turn_count == 150) {
        if (!game_won) {
            alert("Game over, you lose!\nBut you can continue if you want")
        }
    }

    updateFoodPerTurn()
    updateCulturePerTurn()

    global_stats.population_cap = Math.floor(global_stats.base_population_cap * global_modifiers.population_cap_modifier)

    global_stats.total_culture += global_stats.culture_per_turn;
    global_stats.total_production += global_stats.production_per_turn

    if (global_stats.population + global_stats.food_per_turn / global_stats.population_growth_cost < global_stats.population_cap) {
        global_stats.population += global_stats.food_per_turn / global_stats.population_growth_cost
    }
    else {
        global_stats.population = global_stats.population_cap
    }

    if (global_stats.total_culture >= global_stats.technology_culture_cost) {
        global_stats.total_culture -= global_stats.technology_culture_cost
        global_stats.technology_points += 1
        global_stats.technology_culture_cost += global_stats.technology_culture_cost * global_modifiers.tech_cost_modifier * 0.25
    }
    global_stats.enemy_strength = (turn_count ** 2) / 200
    checkForCombat()
    updateFreePops()
    renderState()
}

updateFreePops()
updateFoodPerTurn()
updateCulturePerTurn()
updateProductionPerTurn()
renderState()

function renderState() {
    const current_pop = document.getElementById("current_pop")
    current_pop.innerText = parseFloat(global_stats.population.toFixed(2))

    const max_pop = document.getElementById("max_pop")
    max_pop.innerText = global_stats.population_cap

    const population_growth = document.getElementById("population_growth")
    if (global_stats.food_per_turn / global_stats.population_growth_cost > 0) {
        population_growth.innerText = "+" + parseFloat((global_stats.food_per_turn / global_stats.population_growth_cost).toFixed(2))
    }
    else {
        population_growth.innerText = parseFloat((global_stats.food_per_turn / global_stats.population_growth_cost).toFixed(2))
    }

    const food_per_turn = document.getElementById("food_per_turn")
    food_per_turn.innerText = parseFloat(global_stats.food_per_turn.toFixed(2))

    const total_culture = document.getElementById("total_culture")
    total_culture.innerText = parseFloat(global_stats.total_culture.toFixed(2))

    const tech_cost = document.getElementById("tech_cost")
    tech_cost.innerText = parseFloat(global_stats.technology_culture_cost.toFixed(2))

    const culture_per_turn = document.getElementById("culture_per_turn")
    culture_per_turn.innerText = parseFloat(global_stats.culture_per_turn.toFixed(2))

    const total_production = document.getElementById("total_production")
    total_production.innerText = parseFloat(global_stats.total_production.toFixed(2))

    const production_per_turn = document.getElementById("production_per_turn")
    production_per_turn.innerText = parseFloat(global_stats.production_per_turn.toFixed(2))

    const current_turn = document.getElementById("current_turn")
    current_turn.innerText = turn_count

    const free_pop = document.getElementById("free_pop")
    free_pop.innerText = global_stats.free_pop

    const current_farming_pop = document.getElementById("current_farming_pop")
    current_farming_pop.innerText = global_stats.farming_assigned_pop

    const max_farming_pop = document.getElementById("max_farming_pop")
    max_farming_pop.innerText = global_stats.farming_max_pop

    const current_hearding_pop = document.getElementById("current_hearding_pop")
    current_hearding_pop.innerText = global_stats.hearding_assigned_pop

    const max_hearding_pop = document.getElementById("max_hearding_pop")
    max_hearding_pop.innerText = global_stats.hearding_max_pop

    const current_fishig_pop = document.getElementById("current_fishig_pop")
    current_fishig_pop.innerText = global_stats.fishing_assigned_pop

    const max_fishing_pop = document.getElementById("max_fishing_pop")
    max_fishing_pop.innerText = global_stats.fishing_max_pop

    const current_temple_pop = document.getElementById("current_temple_pop")
    current_temple_pop.innerText = global_stats.temple_assigned_pop

    const max_temple_pop = document.getElementById("max_temple_pop")
    max_temple_pop.innerText = global_stats.temple_max_pop

    const current_mines_pop = document.getElementById("current_mines_pop")
    current_mines_pop.innerText = global_stats.mines_assigned_pop

    const max_mines_pop = document.getElementById("max_mines_pop")
    max_mines_pop.innerText = global_stats.mines_max_pop

    const army_strength = document.getElementById("army_strength")
    army_strength.innerText = parseFloat(global_stats.army_strength.toFixed(2))

    const enemy_strength = document.getElementById("enemy_strength")
    enemy_strength.innerText = parseFloat(global_stats.enemy_strength.toFixed(2))

    const tech_points = document.getElementById("tech_points")
    tech_points.innerText = global_stats.technology_points

    const strength_modifier = document.getElementById("strength_modifier")
    strength_modifier.innerText = Math.round((global_modifiers.army_strength_modifier - 1) * 100) + "%"

    renderBuildings()
    renderTechnologies()

    console.log(global_stats)
}

function renderBuildings() {
    const buildings_list = document.getElementById("buildings")
    buildings_list.innerHTML = ""
    for (let i = 0; i < buildings.length; i++) {
        if (buildings[i].max_level < 1) {
            continue
        }
        let card = document.createElement("div")
        let name = document.createElement("b")
        name.innerText = buildings[i].name

        let description = document.createElement("span")
        description.innerText = buildings[i].description

        let level = document.createElement("span")
        level.innerText = " Level: " + buildings[i].level + "/" + buildings[i].max_level

        let cost = document.createElement("span")
        buildings[i].cost = buildings[i].base_cost + buildings[i].base_cost * buildings[i].level
        cost.innerText = " Cost: " + buildings[i].cost

        let button = document.createElement("button")
        button.disabled = buildings[i].cost > global_stats.total_production || buildings[i].level >= buildings[i].max_level
        button.innerText = "Build"

        button.addEventListener('click', e => {
            build(i)
        });

        card.appendChild(name)
        // card.appendChild(document.createElement("br"))
        // card.appendChild(description)
        card.appendChild(document.createElement("br"))
        card.appendChild(level)
        card.appendChild(cost)
        card.appendChild(button)

        buildings_list.appendChild(card)
    }
}

function renderTechnologies() {
    const tech_list = document.getElementById("technologies")
    tech_list.innerHTML = ""
    for (let i = 0; i < technologies.length; i++) {
        let card = document.createElement("div")
        let name = document.createElement("b")
        name.innerText = technologies[i].name

        let description = document.createElement("span")
        description.innerText = technologies[i].description

        let button = document.createElement("button")
        button.disabled = !(global_stats.technology_points >= 1 && technologies[i].requirements.every(element => global_stats.researched_technologies.includes(element)))
        button.innerText = "Research"

        if (technologies[i].is_researched) {
            button.disabled = true
            button.innerText = "Reasearched"
        }

        button.addEventListener('click', e => {
            research(i)
        });

        card.appendChild(name)
        card.appendChild(document.createElement("br"))
        card.appendChild(description)
        card.appendChild(document.createElement("br"))
        card.appendChild(button)

        tech_list.appendChild(card)
    }
}

function updatePopCap() {
    global_stats.population_cap = Math.floor(global_stats.base_population_cap * global_modifiers.population_cap_modifier)
}

function updateFreePops() {

    global_stats.free_pop = Math.floor(global_stats.population - global_stats.farming_assigned_pop - global_stats.hearding_assigned_pop - global_stats.fishing_assigned_pop - global_stats.temple_assigned_pop - global_stats.mines_assigned_pop)
    global_stats.army_strength = global_stats.free_pop * global_modifiers.army_strength_modifier

}

function updateFoodPerTurn() {
    food_per_turn = (global_stats.farming_assigned_pop * global_stats.farming_food_per_pop
        + global_stats.hearding_assigned_pop * global_stats.hearding_food_per_pop
        + global_stats.fishing_assigned_pop * global_stats.fishing_food_per_pop) * global_modifiers.food_modifier
        - (global_stats.population * global_stats.population_food_cost) * global_modifiers.food_cost_modifier
    if (food_per_turn < 0) {
        food_per_turn -= 0.5
    }
    global_stats.food_per_turn = food_per_turn;
}

function updateCulturePerTurn() {
    culture_per_turn = global_stats.base_culture + (global_stats.temple_assigned_pop * global_stats.culture_per_pop) * global_modifiers.culture_modifier
    global_stats.culture_per_turn = culture_per_turn
}

function updateProductionPerTurn() {
    production_per_turn = global_stats.mines_assigned_pop * global_stats.production_per_pop * global_modifiers.production_modifier
    global_stats.production_per_turn = production_per_turn
}

function hasEnoughPopulation() {
    return Math.floor(global_stats.population - global_stats.farming_assigned_pop - global_stats.hearding_assigned_pop - global_stats.fishing_assigned_pop - global_stats.temple_assigned_pop - global_stats.mines_assigned_pop) >= 0
}

function assignFarmPop() {
    if (global_stats.farming_assigned_pop + 1 <= global_stats.farming_max_pop) {
        global_stats.farming_assigned_pop += 1
        if (!hasEnoughPopulation()) {
            global_stats.farming_assigned_pop -= 1
        }
    }
    else {
        global_stats.farming_assigned_pop = global_stats.farming_max_pop
    }
    updateFoodPerTurn()
    updateFreePops()
    renderState()
}

function unassignFarmPop() {
    if (global_stats.farming_assigned_pop - 1 >= 0) {
        global_stats.farming_assigned_pop -= 1
    }
    else {
        global_stats.farming_assigned_pop = 0
    }
    updateFoodPerTurn()
    updateFreePops()
    renderState()
}

function assignHeardingPop() {
    if (global_stats.hearding_assigned_pop + 1 <= global_stats.hearding_max_pop) {
        global_stats.hearding_assigned_pop += 1
        if (!hasEnoughPopulation()) {
            global_stats.hearding_assigned_pop -= 1
        }
    }
    else {
        global_stats.hearding_assigned_pop = global_stats.hearding_max_pop
    }
    updateFoodPerTurn()
    updateFreePops()
    renderState()
}

function unassignHeardingPop() {
    if (global_stats.hearding_assigned_pop - 1 >= 0) {
        global_stats.hearding_assigned_pop -= 1
    }
    else {
        global_stats.hearding_assigned_pop = 0
    }
    updateFoodPerTurn()
    updateFreePops()
    renderState()
}

function assignFishingPop() {
    if (global_stats.fishing_assigned_pop + 1 <= global_stats.fishing_max_pop) {
        global_stats.fishing_assigned_pop += 1
        if (!hasEnoughPopulation()) {
            global_stats.fishing_assigned_pop -= 1
        }
    }
    else {
        global_stats.fishing_assigned_pop = global_stats.fishing_max_pop
    }
    updateFoodPerTurn()
    updateFreePops()
    renderState()
}

function unassignFishingPop() {
    if (global_stats.fishing_assigned_pop - 1 >= 0) {
        global_stats.fishing_assigned_pop -= 1
    }
    else {
        global_stats.fishing_assigned_pop = 0
    }
    updateFoodPerTurn()
    updateFreePops()
    renderState()
}

function assignTemplePop() {
    if (global_stats.temple_assigned_pop + 1 <= global_stats.temple_max_pop) {
        global_stats.temple_assigned_pop += 1
        if (!hasEnoughPopulation()) {
            global_stats.temple_assigned_pop -= 1
        }
    }
    else {
        global_stats.temple_assigned_pop = global_stats.temple_max_pop
    }
    updateCulturePerTurn()
    updateFreePops()
    renderState()
}

function unassignTemplePop() {
    if (global_stats.temple_assigned_pop - 1 >= 0) {
        global_stats.temple_assigned_pop -= 1
    }
    else {
        global_stats.temple_assigned_pop = 0
    }
    updateCulturePerTurn()
    updateFreePops()
    renderState()
}

function assignMinesPop() {
    if (global_stats.mines_assigned_pop + 1 <= global_stats.mines_max_pop) {
        global_stats.mines_assigned_pop += 1
        if (!hasEnoughPopulation()) {
            global_stats.mines_assigned_pop -= 1
        }
    }
    else {
        global_stats.mines_assigned_pop = global_stats.mines_max_pop
    }
    updateProductionPerTurn()
    updateFreePops()
    renderState()
}

function unassignMinesPop() {
    if (global_stats.mines_assigned_pop - 1 >= 0) {
        global_stats.mines_assigned_pop -= 1
    }
    else {
        global_stats.mines_assigned_pop = 0
    }
    updateProductionPerTurn()
    updateFreePops()
    renderState()
}

function build(i) {
    global_stats.total_production -= buildings[i].cost
    buildings[i].effect()
    buildings[i].level += 1

    renderState()
}

function research(i) {
    if (technologies[i].requirements.every(element => global_stats.researched_technologies.includes(element)) && !technologies[i].is_researched) {
        technologies[i].is_researched = true
        technologies[i].effect()
        global_stats.researched_technologies.push(technologies[i].name)
        global_stats.technology_points -= 1
    }

    renderState()
}
function checkForCombat() {

    let strength_ratio = global_stats.army_strength / global_stats.enemy_strength
    let random = Math.random()
    if (global_stats.enemy_strength >= 2) {
        if (random >= strength_ratio) {
            combatEvent()
        }
    }
}

function combatEvent() {
    let casualties = Math.abs(Math.round(global_stats.army_strength - global_stats.enemy_strength))
    alert("You have been attacked, our brave men have defended the land, " + casualties + " of them have perished")
    reducePopulation(casualties)
    if (global_stats.population <= 0) {
        game_won = false
        alert("Enemy armies destroyed your civilization, you have lost!")
        location.reload()
    }
}
function reducePopulation(number) {
    let amount = number
    global_stats.population -= amount

    if (amount >= global_stats.free_pop) {
        let x = global_stats.free_pop
        global_stats.free_pop = 0
        amount -= x
    }
    else {
        global_stats.free_pop -= amount
        return;
    }
    if (amount >= global_stats.farming_assigned_pop) {
        let x = global_stats.farming_assigned_pop
        global_stats.free_pop = 0
        amount -= x
    }
    else {
        global_stats.farming_assigned_pop -= amount
        return;
    }
    if (amount >= global_stats.hearding_assigned_pop) {
        let x = global_stats.hearding_assigned_pop
        global_stats.hearding_assigned_pop = 0
        amount -= x
    }
    else {
        global_stats.hearding_assigned_pop -= amount
        return;
    }
    if (amount >= global_stats.fishing_assigned_pop) {
        let x = global_stats.fishing_assigned_pop
        global_stats.fishing_assigned_pop = 0
        amount -= x
    }
    else {
        global_stats.fishing_assigned_pop -= amount
        return;
    }
    if (amount >= global_stats.temple_assigned_pop) {
        let x = global_stats.temple_assigned_pop
        global_stats.temple_assigned_pop = 0
        amount -= x
    }
    else {
        global_stats.temple_assigned_pop -= amount
        return;
    }
    if (amount >= global_stats.mines_assigned_pop) {
        let x = global_stats.mines_assigned_pop
        global_stats.mines_assigned_pop = 0
        amount -= x
    }
    else {
        global_stats.mines_assigned_pop -= amount
        return;
    }

    updateFreePops()
    updateCulturePerTurn()
    updateProductionPerTurn()
    updateFreePops()

    renderState()
}