<template>
  <Screen>
    <div v-if="imagesReady" class="speaker-practice">
      <h2>Esercitazione nel ruolo di parlante</h2>

      <p class="instruction-text">
        Ora proverai il ruolo di parlante!
      </p>

      <img
        :src="currentTrial.image"
        class="practice-image"
        alt="Speaker practice grid"
      />

      <div class="response-area">
        <label>
          Descrizione
          <textarea
            v-model.trim="description"
            placeholder="Descrivi l'oggetto marcato dall'asterisco (*)."
          />
        </label>

        <label>
          Spiegazione
          <textarea
            v-model.trim="explanation"
            placeholder="Spiega brevemente perché hai scelto questa descrizione."
          />
        </label>
      </div>

      <button
        v-if="canContinue"
        class="next-button"
        @click="nextTrial"
      >
        {{ currentTrialIndex < practiceTrials.length - 1 ? "Avanti" : "Avanti" }}
      </button>
    </div>

    <div v-else class="preload-placeholder"></div>
  </Screen>
</template>

<script>
export default {
  name: "SpeakerPracticeBlock",

  data() {
    return {
      currentTrialIndex: 0,
      description: "",
      explanation: "",
      trialStartTime: null,
      blockStartTime: null,
      responses: [],
      imagesReady: false,

      practiceTrials: [
        {
          id: "speaker_practice_size",
          condition: "size",
          image: "instructions/speaker_practice_size.png"
        },
        {
          id: "speaker_practice_filler",
          condition: "filler",
          image: "instructions/speaker_practice_filler.png"
        },
        {
          id: "speaker_practice_color",
          condition: "color",
          image: "instructions/speaker_practice_color.png"
        }
      ]
    };
  },

  computed: {
    currentTrial() {
      return this.practiceTrials[this.currentTrialIndex];
    },

    canContinue() {
      return this.description.length > 0 && this.explanation.length > 0;
    }
  },

  mounted() {
    this.preloadImages().then(() => {
      this.imagesReady = true;

      this.$nextTick(() => {
        requestAnimationFrame(() => {
          this.blockStartTime = performance.now();
          this.trialStartTime = performance.now();
        });
      });
    });
  },

  methods: {
    preloadImages() {
      const preloadOne = src =>
        new Promise(resolve => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        });

      return Promise.all(this.practiceTrials.map(trial => preloadOne(trial.image)));
    },

    nextTrial() {
      const now = performance.now();

      this.responses.push({
        trial_type: "speaker_practice_trial",
        trial_id: this.currentTrial.id,
        condition: this.currentTrial.condition,
        description: this.description,
        explanation: this.explanation,
        rt: now - this.trialStartTime
      });

      if (this.currentTrialIndex < this.practiceTrials.length - 1) {
        this.currentTrialIndex++;
        this.description = "";
        this.explanation = "";

        this.$nextTick(() => {
          requestAnimationFrame(() => {
            this.trialStartTime = performance.now();
          });
        });
      } else {
        this.finishPractice(now);
      }
    },

    finishPractice(endTime) {
      const trialData = {
        trial_type: "speaker_practice_block",
        phase: "speaker_practice",
        block_rt: endTime - this.blockStartTime,
        responses_json: JSON.stringify(this.responses)
      };

      this.responses.forEach((response, index) => {
        const n = index + 1;
        trialData[`speaker_practice_trial_id_${n}`] = response.trial_id;
        trialData[`speaker_practice_condition_${n}`] = response.condition;
        trialData[`speaker_practice_description_${n}`] = response.description;
        trialData[`speaker_practice_explanation_${n}`] = response.explanation;
        trialData[`speaker_practice_rt_${n}`] = response.rt;
      });

      this.$magpie.addTrialData(trialData);
      this.$magpie.nextScreen();
    }
  }
};
</script>

<style scoped>
.speaker-practice {
  width: 720px;
  max-width: 95vw;
  margin: 0 auto;
  text-align: center;
}

.speaker-practice h2 {
  text-align: center;
  margin-bottom: 16px;
}

.instruction-text {
  font-size: 20px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.practice-image {
  display: block;
  width: min(440px, 62vh);
  margin: 0 auto 24px auto;
}

.response-area {
  width: 100%;
  max-width: 620px;
  margin: 0 auto;
  text-align: left;
}

.response-area label {
  display: block;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 18px;
}

.response-area textarea {
  display: block;
  width: 100%;
  min-height: 80px;
  margin-top: 8px;
  padding: 10px;
  font-size: 17px;
  line-height: 1.4;
  resize: vertical;
  box-sizing: border-box;
}

.next-button {
  display: block;
  margin: 24px auto 0 auto;
}

.preload-placeholder {
  width: 100%;
  min-height: 90vh;
}
</style>