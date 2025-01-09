function getPokemonLevel(pokemon) {
  const evolution = pokemon.evolution;

  if (evolution && evolution.prev && evolution.prev.length > 1) {
    const prevCondition = evolution.prev[1]; // e.g., "Level 16" or "use Thunder Stone"
    if (prevCondition.startsWith("Level")) {
      return parseInt(prevCondition.replace("Level ", ""));
    }
  }

  return 1;
}

module.exports = getPokemonLevel;
