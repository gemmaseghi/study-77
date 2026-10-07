<template>
  <Experiment title="Awareness-Norming Experiment">

    <InstructionsSpeaker />

    <PracticeSpeaker />

    <InstructionsListener />

    <PracticeListener />

    <InstructionsWithBack />


    <GridTrial
      v-for="trial in trials"
      :key="`${trial.phase}-${trial.id}`"
      :trial="trial"
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
      trials
    };
  }
};
</script>

<style>
.experiment {
  width: 1500px !important;
  max-width: 95vw !important;
}
</style>