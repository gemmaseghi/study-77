<template>
  <Screen>
    <div v-if="imagesReady" class="listener-practice">
      <h2>Esercitazione nel ruolo di ascoltatore</h2>

      <p class="instruction-text">
        Seleziona l'oggetto che pensi Leo stia descrivendo.
      </p>

      <h3 class="utterance">
        {{ currentTrial.utterance }}
      </h3>

      <div class="grid-wrapper">
        <img
          :src="currentTrial.image"
          class="practice-image"
          alt="Listener practice grid"
        />

        <button class="cell top-left" @click="selectObject('topLeft')" />
        <button class="cell top-right" @click="selectObject('topRight')" />
        <button class="cell bottom-left" @click="selectObject('bottomLeft')" />
        <button class="cell bottom-right" @click="selectObject('bottomRight')" />

        <div
          v-if="selection"
          class="selection-marker"
          :class="selection"
        />
      </div>

      <div class="response-area">
        <label>
          Spiegazione
          <textarea
            v-model.trim="explanation"
            placeholder="Spiega brevemente perché pensi che Leo abbia scelto questa descrizione."
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
  name: "ListenerPracticeBlock",

  data() {
    return {
      currentTrialIndex: 0,
      selection: null,
      explanation: "",
      trialStartTime: null,
      blockStartTime: null,
      responses: [],
      imagesReady: false,

      practiceTrials: [
        {
          id: "listener_practice_size",
          condition: "size",
          utterance: "La fragola piccola",
          image: "instructions/listener_practice_size.png"
        },
        {
          id: "listener_practice_filler",
          condition: "filler",
          utterance: "La bicicletta",
          image: "instructions/listener_practice_filler.png"
        },
        {
          id: "listener_practice_color",
          condition: "color",
          utterance: "La cannuccia blu",
          image: "instructions/listener_practice_color.png"
        }
      ]
    };
  },

  computed: {
    currentTrial() {
      return this.practiceTrials[this.currentTrialIndex];
    },

    canContinue() {
      return this.selection !== null && this.explanation.length > 0;
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

    selectObject(cell) {
      this.selection = cell;
    },

    nextTrial() {
      const now = performance.now();

      this.responses.push({
        trial_type: "listener_practice_trial",
        trial_id: this.currentTrial.id,
        condition: this.currentTrial.condition,
        utterance: this.currentTrial.utterance,
        selection: this.selection,
        explanation: this.explanation,
        rt: now - this.trialStartTime
      });

      if (this.currentTrialIndex < this.practiceTrials.length - 1) {
        this.currentTrialIndex++;
        this.selection = null;
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
        trial_type: "listener_practice_block",
        phase: "listener_practice",
        block_rt: endTime - this.blockStartTime,
        responses_json: JSON.stringify(this.responses)
      };

      this.responses.forEach((response, index) => {
        const n = index + 1;
        trialData[`listener_practice_trial_id_${n}`] = response.trial_id;
        trialData[`listener_practice_condition_${n}`] = response.condition;
        trialData[`listener_practice_utterance_${n}`] = response.utterance;
        trialData[`listener_practice_selection_${n}`] = response.selection;
        trialData[`listener_practice_explanation_${n}`] = response.explanation;
        trialData[`listener_practice_rt_${n}`] = response.rt;
      });

      this.$magpie.addTrialData(trialData);
      this.$magpie.nextScreen();
    }
  }
};
</script>

<style scoped>
.listener-practice {
  width: 720px;
  max-width: 95vw;
  margin: 0 auto;
  text-align: center;
}

.listener-practice h2 {
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

.utterance {
  text-align: center;
  font-size: 26px;
  margin: 0 0 16px 0;
}

.grid-wrapper {
  position: relative;
  width: min(440px, 62vh);
  margin: 0 auto 24px auto;
  line-height: 0;
}

.practice-image {
  display: block;
  width: 100%;
}

.cell {
  position: absolute;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  appearance: none;
  -webkit-appearance: none;
  opacity: 0;
  cursor: pointer;
}

.top-left {
  top: 0;
  left: 0;
  width: 50%;
  height: 50%;
}

.top-right {
  top: 0;
  left: 50%;
  width: 50%;
  height: 50%;
}

.bottom-left {
  top: 50%;
  left: 0;
  width: 50%;
  height: 50%;
}

.bottom-right {
  top: 50%;
  left: 50%;
  width: 50%;
  height: 50%;
}

.selection-marker {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: black;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.selection-marker.topLeft {
  top: 25%;
  left: 25%;
}

.selection-marker.topRight {
  top: 25%;
  left: 75%;
}

.selection-marker.bottomLeft {
  top: 75%;
  left: 25%;
}

.selection-marker.bottomRight {
  top: 75%;
  left: 75%;
}

</style>