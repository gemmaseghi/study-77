<template>
  <Screen>
    <div class="trial-layout">
      <h3 class="utterance">{{ trial.utterance }}</h3>

      <div class="grid-wrapper">
        <img
          :src="imageSrc"
          class="stimulus"
          alt="Four objects arranged in a two-by-two grid"
          @load="onImageLoad"
          @error="imageError = true"
        />

        <button
          v-for="cell in cells"
          :key="cell.value"
          type="button"
          class="cell"
          :class="cell.value"
          :aria-label="cell.label"
          :disabled="!ready || response !== null || finished"
          @click="selectCell(cell.value)"
        ></button>

        <div
          v-if="response !== null"
          class="selection-marker"
          :class="response"
          aria-hidden="true"
        ></div>
      </div>

      <p v-if="imageError" role="alert">
        The image could not be loaded. Please contact the researcher.
      </p>

      <div class="probe-space">
        <div v-if="response !== null" class="confidence-panel">
          <label :for="sliderId" class="confidence-question">
            In generale, quanto sei sicuro che Leo non veda il contenuto della cella grigia?
          </label>

          <div class="slider-container">
            <input
              :id="sliderId"
              :value="confidence"
              :aria-describedby="`${sliderId}-endpoints`"
              class="confidence-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              :disabled="confidenceStartTime === null || finished"
              @input="updateConfidence"
              @change="updateConfidence"
            />

            <div class="slider-numbers" aria-hidden="true">
              <span style="left: 0%">0</span>
              <span style="left: 25%">25</span>
              <span style="left: 50%">50</span>
              <span style="left: 75%">75</span>
              <span style="left: 100%">100</span>
            </div>

            <div
              :id="`${sliderId}-endpoints`"
              class="slider-endpoints"
            >
              <span>Per nulla sicuro</span>
              <span>Estremamente sicuro</span>
            </div>
          </div>

          <div class="next-slot">
            <button
              v-if="sliderMoved"
              type="button"
              class="next-button"
              :disabled="finished"
              @click="finishTrial"
            >
              Avanti
            </button>
          </div>
        </div>
      </div>
    </div>
  </Screen>
</template>

<script>
export default {
  name: "GridTrial",

  props: {
    trial: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      response: null,
      confidence: 50,
      sliderMoved: false,

      ready: false,
      imageError: false,
      finished: false,

      gridStartTime: null,
      selectionRT: null,
      confidenceStartTime: null,
      firstSliderMovementRT: null,

      onsetFrame: null,
      probeFrame: null,

      cells: [
        { value: "topLeft", label: "Select top-left object" },
        { value: "topRight", label: "Select top-right object" },
        { value: "bottomLeft", label: "Select bottom-left object" },
        { value: "bottomRight", label: "Select bottom-right object" }
      ]
    };
  },

  computed: {
    sliderId() {
      return `blindspot-confidence-${this.trial.phase}-${this.trial.id}`;
    },

    imageSrc() {
      const src = this.trial.image;

      // Leave external URLs and embedded images unchanged.
      if (/^(https?:|data:|blob:|\/\/)/i.test(src)) {
        return src;
      }

      // Respect the project's base path when hosted on GitHub Pages.
      const base = process.env.BASE_URL || "/";

      return `${base.replace(/\/$/, "")}/${src.replace(/^\/+/, "")}`;
    }
  },

  beforeDestroy() {
    if (this.onsetFrame !== null) {
      cancelAnimationFrame(this.onsetFrame);
    }

    if (this.probeFrame !== null) {
      cancelAnimationFrame(this.probeFrame);
    }
  },

  methods: {
    onImageLoad() {
      if (this.ready || this.onsetFrame !== null) return;

      this.imageError = false;

      this.onsetFrame = requestAnimationFrame(() => {
        this.gridStartTime = performance.now();
        this.ready = true;
      });
    },

    selectCell(answer) {
      if (!this.ready || this.response !== null || this.finished) {
        return;
      }

      this.selectionRT = performance.now() - this.gridStartTime;
      this.response = answer;

      this.$nextTick(() => {
        this.probeFrame = requestAnimationFrame(() => {
          this.confidenceStartTime = performance.now();
        });
      });
    },

    updateConfidence(event) {
      if (
        this.response === null ||
        this.confidenceStartTime === null ||
        this.finished
      ) {
        return;
      }

      const value = Number(event.target.value);

      if (!Number.isFinite(value) || value < 0 || value > 100) {
        return;
      }

      this.confidence = value;

      // Moving away from 50 unlocks Next.
      // Returning to 50 afterward is allowed.
      if (!this.sliderMoved && value !== 50) {
        this.sliderMoved = true;
        this.firstSliderMovementRT =
          performance.now() - this.confidenceStartTime;
      }
    },

    finishTrial() {
      if (
        this.finished ||
        this.response === null ||
        !this.sliderMoved
      ) {
        return;
      }

      this.finished = true;
      const now = performance.now();

      this.$magpie.addTrialData({
        trial_id: this.trial.id,
        phase: this.trial.phase,
        condition: this.trial.condition,
        utterance: this.trial.utterance,
        item: this.trial.item,
        image: this.trial.image,

        grey_cell: this.trial.greyCell,
        correct_answer: this.trial.correctAnswer,
        response: this.response,
        correct: this.response === this.trial.correctAnswer,
        selected_grey_cell: this.response === this.trial.greyCell,

        rt: this.selectionRT,
        confidence: this.confidence,
        confidence_rt: now - this.confidenceStartTime,
        first_slider_movement_rt: this.firstSliderMovementRT,
        slider_moved: this.sliderMoved,
        trial_rt: now - this.gridStartTime
      });

      this.$magpie.nextScreen();
    }
  }
};
</script>

<style scoped>
.trial-layout {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  box-sizing: border-box;
}

.utterance {
  text-align: center;
  font-size: 24px;
  line-height: 1.25;
  margin: 0 0 12px;
}

/* Grid */
.grid-wrapper {
  position: relative;
  width: min(460px, 52vh, 90vw);
  line-height: 0;
}

.stimulus {
  display: block;
  width: 100%;
  height: auto;
  max-height: none;
}

.cell {
  position: absolute;
  width: 50%;
  height: 50%;
  background: transparent;
  border: none;
  border-radius: 0;
  margin: 0;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.cell:hover,
.cell:focus,
.cell:disabled {
  background: transparent;
}

.cell:disabled {
  cursor: default;
}

.cell:focus-visible {
  outline: 3px solid #245cc5;
  outline-offset: -3px;
}

.cell.topLeft {
  top: 0;
  left: 0;
}

.cell.topRight {
  top: 0;
  left: 50%;
}

.cell.bottomLeft {
  top: 50%;
  left: 0;
}

.cell.bottomRight {
  top: 50%;
  left: 50%;
}

/* Black selection dot */
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

/* Confidence question */
.probe-space {
  width: 100%;
  max-width: 700px;
  min-height: 190px;
  margin-top: 18px;
}

.confidence-panel {
  text-align: center;
}

.confidence-question {
  display: block;
  font-size: 18px;
  line-height: 1.3;
  margin-bottom: 16px;
}

/* Slider */
.slider-container {
  width: 100%;
}

.confidence-slider {
  display: block;
  width: 100%;
  height: 28px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

/* Chrome, Edge, Safari */
.confidence-slider::-webkit-slider-runnable-track {
  height: 10px;
  background: #d6d6d6;
  border-radius: 5px;
}

.confidence-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  margin-top: -7px;
  background: #245cc5;
  border: 2px solid white;
  border-radius: 50%;
  box-sizing: border-box;
}

/* Firefox */
.confidence-slider::-moz-range-track {
  height: 10px;
  background: #d6d6d6;
  border-radius: 5px;
}

.confidence-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: #245cc5;
  border: 2px solid white;
  border-radius: 50%;
  box-sizing: border-box;
}

.confidence-slider:focus-visible {
  outline: 2px solid #245cc5;
  outline-offset: 4px;
}

.confidence-slider:disabled {
  cursor: default;
}

/* Numbers align with the slider thumb's centre. */
.slider-numbers {
  position: relative;
  height: 25px;
  margin: 4px 12px 0;
  font-size: 16px;
  line-height: 25px;
}

.slider-numbers span {
  position: absolute;
  transform: translateX(-50%);
}

.slider-endpoints {
  position: relative;
  width: auto;
  height: 40px;
  margin: 8px 12px 0;
  font-size: 15px;
  line-height: 1.3;
}

.slider-endpoints span {
  position: absolute;
  top: 0;
  white-space: nowrap;
}

.slider-endpoints span:first-child {
  left: 0;
  text-align: left;
}

.slider-endpoints span:last-child {
  right: 0;
  text-align: right;
}

/* Next button */
.next-slot {
  min-height: 50px;
  margin-top: 14px;
}

.next-button {
  display: inline-block;
  margin: 0;
  padding: 9px 28px;
  background: white;
  color: black;
  border: 2px solid black;
  border-radius: 4px;
  font-size: 17px;
  cursor: pointer;
}

.next-button:hover {
  background: #eeeeee;
}

.next-button:focus-visible {
  outline: 3px solid #245cc5;
  outline-offset: 3px;
}
</style>