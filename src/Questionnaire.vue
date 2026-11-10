<template>
  <Screen>
    <h2>Final Questionnaire</h2>

    <!-- Step 1: Rules summary -->
    <div v-if="step === 1" class="question">
      <p>
        Please summarize the rules of the game in bullet points for the next participant.
      </p>

      <textarea
        v-model="strategyExplanation"
        class="rules-summary"
        aria-label="Summary of the game rules"
      ></textarea>

      <button
        :disabled="!strategyExplanation.trim()"
        @click="step = 2"
      >
        Next
      </button>
    </div>

    <!-- Step 2: Peculiar events -->
    <div v-if="step === 2" class="question">
      <p>Did you notice anything peculiar while playing the game?</p>

      <div class="radio-container">
        <label>
          <input type="radio" value="yes" v-model="peculiar" />
          Yes
        </label>

        <label>
          <input type="radio" value="no" v-model="peculiar" />
          No
        </label>
      </div>

      <button
        :disabled="!peculiar"
        @click="step = peculiar === 'yes' ? 3 : 4"
      >
        Next
      </button>
    </div>

    <!-- Step 3: Follow-up only for a yes response -->
    <div v-if="step === 3" class="question">
      <p>What did you notice?</p>

      <textarea
        v-model="peculiarExplanation"
        aria-label="What you noticed"
      ></textarea>

      <button
        :disabled="!peculiarExplanation.trim()"
        @click="step = 4"
      >
        Next
      </button>
    </div>

    <!-- Step 4: Suspicion -->
    <div v-if="step === 4" class="question">
      <p>
        Did you ever suspect that the instructions you received were
        somehow defective and that your opponent knew more about
        the game than you did?
      </p>

      <div class="radio-container">
        <label>
          <input type="radio" value="yes" v-model="suspicion" />
          Yes
        </label>

        <label>
          <input type="radio" value="no" v-model="suspicion" />
          No
        </label>
      </div>

      <button :disabled="!suspicion" @click="step = 5">
        Next
      </button>
    </div>

    <!-- Step 5: Suspicion explanation -->
    <div v-if="step === 5" class="question">
      <div v-if="suspicion === 'yes'">
        <p>
          Please explain why and give examples from the game.
        </p>

        <textarea
          v-model="suspicionYesExplanation"
          aria-label="Reasons for your suspicion and examples"
        ></textarea>
      </div>

      <div v-else-if="suspicion === 'no'">
        <p>Please explain why.</p>

        <textarea
          v-model="suspicionNoExplanation"
          aria-label="Reasons for not suspecting this"
        ></textarea>
      </div>

      <button :disabled="!canSubmit" @click="submitQuestionnaire">
        Next
      </button>
    </div>
  </Screen>
</template>

<script>
export default {
  name: "Questionnaire",

  data() {
    return {
      step: 1,
      strategyExplanation: "",
      peculiar: "",
      peculiarExplanation: "",
      suspicion: "",
      suspicionYesExplanation: "",
      suspicionNoExplanation: ""
    };
  },

  computed: {
    canSubmit() {
      const rulesComplete = this.strategyExplanation.trim().length > 0;

      const peculiarComplete =
        this.peculiar === "no" ||
        (this.peculiar === "yes" &&
          this.peculiarExplanation.trim().length > 0);

      const suspicionComplete =
        (this.suspicion === "yes" &&
          this.suspicionYesExplanation.trim().length > 0) ||
        (this.suspicion === "no" &&
          this.suspicionNoExplanation.trim().length > 0);

      return rulesComplete && peculiarComplete && suspicionComplete;
    }
  },

  methods: {
    submitQuestionnaire() {
      if (!this.canSubmit) return;

      this.$magpie.addTrialData({
        trial_type: "questionnaire",

        strategy_explanation: this.strategyExplanation.trim(),

        peculiar_answer: this.peculiar,
        peculiar_explanation: this.peculiarExplanation.trim(),

        suspicion_answer: this.suspicion,
        suspicion_yes_explanation: this.suspicionYesExplanation.trim(),
        suspicion_no_explanation: this.suspicionNoExplanation.trim(),

        // Examples are now included in suspicion_yes_explanation.
        suspicion_examples: ""
      });

      this.$magpie.nextScreen();
    }
  }
};
</script>

<style scoped>
.question {
  margin-bottom: 25px;
  font-size: 18px;
}

label {
  display: block;
  margin: 8px 0;
}

textarea {
  width: 100%;
  max-width: 800px;
  min-height: 120px;
  box-sizing: border-box;
}

textarea.rules-summary {
  width: 100%;
  max-width: 900px;
  min-height: 350px;
  padding: 15px;
  font-size: 18px;
  line-height: 1.6;
  box-sizing: border-box;
  resize: vertical;
}

button {
  margin-top: 20px;
}

.radio-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 15px 0;
}

.radio-container label {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
}
</style>