<template>
  <Experiment title="Maze-awareness Experiment">
    <InstructionsWithBack />
  
    <ForcedChoice />

    <InstructionsPreGame />

    <GridTrial
      v-for="(trial, index) in trials"
      :key="trial.trial_id"
      :trial="trial"
      :round-number="index + 1"
      :is-last="index === trials.length - 1"
      :game-state="mazeGame"
      @update-game="updateMazeGame"
    />

    <Questionnaire />

    <SubmitResultsScreen />
  </Experiment>
</template>

<script>
import GridTrial from "./GridTrial.vue";
import trials from "./trials";

import InstructionsWithBack from "./InstructionsWithBack.vue";
import ForcedChoice from "./ForcedChoice.vue";


import Questionnaire from "./Questionnaire.vue";
import InstructionsPreGame from "./InstructionsPreGame.vue";

export default {
  name: "App",

  components: {
    InstructionsWithBack,
    ForcedChoice,
    InstructionsPreGame,
    GridTrial,
    Questionnaire
  },

  data() {
    return {
      trials,

      // These values are shared across all maze rounds.
      // They begin at 0 points and 50 confidence.
      mazeGame: {
        participant: 0,
        opponent: 0,
        confidence: 50
      }
    };
  },

  methods: {
    // GridTrial sends the updated totals and confidence here.
    // App keeps them available for the following round.
    updateMazeGame(updatedGame) {
      this.mazeGame = updatedGame;
    }
  }
};
</script>

<style>
.experiment {
  width: 1500px !important;
  max-width: 95vw !important;
}
</style>