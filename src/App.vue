<template>
  <Experiment title="Maze-awareness Experiment">
    <InstructionsSpeaker />

    <PracticeSpeaker />

    <InstructionsListener />

    <PracticeListener />

    <InstructionsWithBack />

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

import InstructionsSpeaker from "./InstructionsSpeaker.vue";
import InstructionsListener from "./InstructionsListener.vue";
import InstructionsWithBack from "./InstructionsWithBack.vue";

import PracticeSpeaker from "./PracticeSpeaker.vue";
import PracticeListener from "./PracticeListener.vue";

import Questionnaire from "./Questionnaire.vue";

export default {
  name: "App",

  components: {
    InstructionsSpeaker,
    PracticeSpeaker,
    InstructionsListener,
    PracticeListener,
    InstructionsWithBack,
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