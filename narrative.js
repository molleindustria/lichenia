//states 0 never, -1 done, 

var story = {
  intro: {
    msg: "When Aeonia fell both men and nature lost"
  },
  intro2: {
    msg: "The elders left so it was our time to start over"
  },
  greenCube: {
    msg: "We had to unlearn master plans and grow our cities like gardens"
  },
  greenCube2: {
    msg: "We were pests and pollinators, crops and weeds"
  },
  greenCube3: {
    msg: "We grew grasslands and forests to reclaim the detritus of the old world"
  },
  blueCube: {
    msg: "The elders called our age Anthropocene"
  },
  blueCube2: {
    msg: "Even though we've always been at the margins of the anthropos"
  },
  blueCube3: {
    msg: "We moved entire bodies of water away from pollutants and remediated them"
  },
  stoneCube: {
    msg: "Our city was born in the shell of the old one"
  },
  stoneCube2: {
    msg: "We named it Lichenia"
  },
  resources: {
    msg: "We vowed to grow only when we had enough resources to sustain us"
  },
  whiteCube: {
    msg: "Lichenia had no center, no palace nor cathedral"
  },
  whiteCube2: {
    msg: "We governed its expansion by creating new centers and attractors"
  },
  glitchCube: {
    msg: "Our religion was Change, and not by choice"
  },
  glitchCube2: {
    msg: "The balance we strived for was dynamic, an eternal dance with chaos"
  },
  cityGrowth: {
    msg: "We learned to live with each other again"
  },
  cityGrowth2: {
    msg: "Healing the soil before laying down new fundations"
  },
  disaster: {
    msg: "The Earth we inherited was still troubled"
  },
  disaster2: {
    msg: "No amount of care could stop its vicious feedbacks"
  },
  wetlands: {
    msg: "We restored lost wetlands to contain floods and erosion"
  },
  trashscapes: {
    msg: "We started to appreciate the beauty of sprawling trashscapes"
  },
  plastigromerate: {
    msg: "Underneath the ruins we discovered strata of ancient plastic"
  },
  badGrowth: {
    msg: "Without enough natural resources parts of our city deteriorated"
  },
  badGrowth2: {
    msg: "Were we just building more ruins?"
  },
  badGrowth3: {
    msg: "We grew beyond our means, repeating the same mistake of the elders"
  },
  extinction: {
    msg: "Perhaps the best solution was voluntary extinction"
  },
  convertForest: {
    msg: "Beneath each street there were new possibilities"
  },
  convertForest2: {
    msg: "We create forest corridors to facilitate migrations"
  },
  convertCanal: {
    msg: "We turned roads into placid waterways"
  },
  //no pollution no ruins
  terraforming: {
    msg: "We realized we were terraforming planet Earth"
  },
  //ending x civilization within means
  end: {
    msg: "As we neared the limits of our habitat, we had a choice:"
  },
  //button appears
  end2: {
    msg: "We could heal other poisoned lands"
  },
  //black cube appears
  end3: {
    msg: "We could evoke the destructive power of the elders"
  },
  //
  end4: {
    msg: "Or we could maintain a homeostatic equilibrium, becoming nature again"
  }
};

//plastics discoveries are ordered
var plastics = [
"No organism could remediate the plastiglomerate, it was going to outlive us",
"Shale rock striated with vivid fast food packaging",
"A meteorite of congealed baby diapers",
"A matrix of tires, asphalt, and traffic cones",
"A ventifact of unknown polymeric matter",
"An exfoliating aggregate of shopping bags and cement",
"A spire of fossilized plastic cups",
"A monumental formation of memory foam mattresses",
"A butte with a glimmering vein of crushed bottles",
"Stalagmites of crystallized straws and stirrers",
"An outcrop of melted toys for girls",
"A pearlescent boulder made of car bumpers and hubcaps",
"Eroded linoleum floors from an ancient hospital",
"Columnar polystyrene",
"Sediments of patterned carpeting and shingles",
"A mesa of coagulated acrylic fabric"
];
