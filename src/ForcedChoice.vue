<template>
  <Screen>
    <div class="maze-practice">
      <h2>Practice: choose the best path</h2>

      <p class="round-label">
        Round {{ currentTrialIndex + 1 }} of {{ practiceTrials.length }}
      </p>

      <p class="instruction-text">
        Between Option A and Option B, select the path that would maximize your points in the game. 
      </p>

      <!-- A new key recreates the images when the round changes. -->
      <div :key="currentTrial.id">
        <!-- The empty grid appears above the two answers. -->
        <figure class="empty-grid">
          <figcaption>{{ currentTrial.title }}</figcaption>

          <img
            :src="currentTrial.emptyImage"
            alt="Empty practice grid"
            @load="markImageLoaded('empty')"
            @error="handleImageError"
          />
        </figure>

        <!-- Each whole card is clickable, including its title and image. -->
        <div class="options">
          <button
            v-for="option in options"
            :key="option.id"
            type="button"
            class="option-card"
            :class="{ selected: selection === option.id }"
            :disabled="!imagesReady || selection !== null || finished"
            :aria-pressed="selection === option.id"
            @click="selectOption(option.id)"
          >
            <span class="option-title">Option {{ option.id }}</span>

            <img
              :src="option.image"
              :alt="'Path shown in Option ' + option.id"
              @load="markImageLoaded(option.id)"
              @error="handleImageError"
            />

            <span class="selection-label">
              {{ selection === option.id ? 'Selected' : '\u00a0' }}
            </span>
          </button>
        </div>
      </div>

      <p v-if="imageError" class="error-message" role="alert">
        An image could not be loaded. Please contact the researcher.
      </p>

      <p v-else-if="!imagesReady" role="status">Loading images…</p>

      <!-- Feedback is immediate. The first answer cannot be changed. -->
      <div
        v-if="selection !== null"
        class="feedback"
        :class="{ correct: isCorrect, incorrect: !isCorrect }"
        role="status"
        aria-live="polite"
      >
        {{ feedbackMessage }}
      </div>

      <p v-if="saveError" class="error-message" role="alert">
        {{ saveError }}
      </p>

      <!-- Both correct and incorrect answers allow forward navigation. -->
      <button
        v-if="selection !== null"
        type="button"
        class="next-button"
        :disabled="saving || finished"
        @click="nextTrial"
      >
        Next
      </button>
    </div>
  </Screen>
</template>

<script>
export default {
  name: "PracticeListener",

  data() {
    return {
      currentTrialIndex: 0,
      selection: null,
      loadedImages: [],
      imageError: false,
      saveError: "",
      saving: false,
      finished: false,

      practiceTrials: [
        {
          id: "maze_practice_1",
          title: "Empty grid",

          emptyImage: "instructions/forced_choice_1.png",
          correctImage: "instructions/correct_option_forced_choice_1.png",
          incorrectImage: "instructions/incorrect_option_forced_choice_1.png",
          correctOption: "A",

          correctPoints: 0,
          incorrectPoints: -2,

          correctMessage:
            "Correct! The path that you selected will give you 0 points, " +
            "while the other option will make you lose 2 points, " +
            "so you chose the option that maximizes the number of points",

          incorrectMessage:
            "Incorrect! The path that you selected will make you lose 2 points, " +
            "while the other option will give you 0 points, " +
            "so you didn't choose the option that maximizes the number of points"
        },

        {
          id: "maze_practice_2",
          title: "Empty grid",

          emptyImage: "instructions/forced_choice_2.png",
          correctImage: "instructions/correct_option_forced_choice_2.png",
          incorrectImage: "instructions/incorrect_option_forced_choice_2.png",
          correctOption: "B",

          correctPoints: 2,
          incorrectPoints: 0,

          correctMessage:
            "Correct! The path that you selected will give you 2 points, " +
            "while the other option will give you 0 points, " +
            "so you chose the option that maximizes the number of points",

          incorrectMessage:
            "Incorrect! The path that you selected will give you 0 points, " +
            "while the other option will give you 2 points, " +
            "so you didn't choose the option that maximizes the number of points"
        }
      ]
    };
  },

  computed: {
    currentTrial() {
      return this.practiceTrials[this.currentTrialIndex];
    },

    // Build Option A and Option B from the correct/incorrect image paths.
    options() {
      return ["A", "B"].map(optionId => ({
        id: optionId,
        image:
          optionId === this.currentTrial.correctOption
            ? this.currentTrial.correctImage
            : this.currentTrial.incorrectImage
      }));
    },

    imagesReady() {
      return !this.imageError && this.loadedImages.length === 3;
    },

    isCorrect() {
      return this.selection === this.currentTrial.correctOption;
    },

    feedbackMessage() {
      if (this.selection === null) return "";

      return this.isCorrect
        ? this.currentTrial.correctMessage
        : this.currentTrial.incorrectMessage;
    }
  },

  methods: {
    markImageLoaded(imageId) {
      if (!this.loadedImages.includes(imageId)) {
        this.loadedImages.push(imageId);
      }
    },

    handleImageError() {
      this.imageError = true;
    },

    selectOption(optionId) {
      // Accept exactly one answer per round, after all images have loaded.
      if (!this.imagesReady || this.selection !== null || this.finished) {
        return;
      }

      if (optionId !== "A" && optionId !== "B") return;

      this.selection = optionId;
    },

    nextTrial() {
      if (this.selection === null || this.saving || this.finished) {
        return;
      }

      this.saving = true;
      this.saveError = "";

      // Save one result row per practice round.
      // Practice points do not change the main game's cumulative scores.
      try {
        this.$magpie.addTrialData({
          trial_type: "maze_practice_trial",
          phase: "maze_practice",
          trial_id: this.currentTrial.id,
          practice_round: this.currentTrialIndex + 1,

          empty_image: this.currentTrial.emptyImage,
          correct_image: this.currentTrial.correctImage,
          incorrect_image: this.currentTrial.incorrectImage,
          option_a_image: this.options[0].image,
          option_b_image: this.options[1].image,

          selected_option: this.selection,
          correct_option: this.currentTrial.correctOption,
          is_correct: this.isCorrect,
          selected_points: this.isCorrect
            ? this.currentTrial.correctPoints
            : this.currentTrial.incorrectPoints,
          other_option_points: this.isCorrect
            ? this.currentTrial.incorrectPoints
            : this.currentTrial.correctPoints,

          feedback_message: this.feedbackMessage
        });
      } catch (error) {
        this.saveError = "Your answer could not be saved. Please try Next again.";
        this.saving = false;
        return;
      }

      const isLastRound =
        this.currentTrialIndex === this.practiceTrials.length - 1;

      if (isLastRound) {
        this.finished = true;
        this.$magpie.nextScreen();
        return;
      }

      // Prepare the next round. There is no previous-round button.
      this.currentTrialIndex += 1;
      this.selection = null;
      this.loadedImages = [];
      this.imageError = false;
      this.saving = false;
    }
  }
};
</script>

<style scoped>
.maze-practice {
  width: 820px;
  max-width: 100%;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;
  text-align: center;
}

.maze-practice h2 {
  margin: 0 0 12px;
}

.round-label {
  color: #555;
  margin: 0 0 12px;
}

.instruction-text {
  font-size: 20px;
  line-height: 1.5;
  margin: 0 0 20px;
}

.empty-grid {
  width: 250px;
  max-width: 60%;
  margin: 0 auto 24px;
}

.empty-grid figcaption,
.option-title {
  display: block;
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: bold;
}

.empty-grid img,
.option-card img {
  display: block;
  width: 100%;
  height: auto;
}

.options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  max-width: 660px;
  margin: 0 auto;
}

.option-card {
  display: block;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 12px;
  border: 3px solid #b8bdc5;
  border-radius: 8px;
  background: #fff;
  color: #222;
  font: inherit;
  cursor: pointer;
  box-sizing: border-box;
}

.option-card:hover:not(:disabled) {
  border-color: #1565c0;
  background: #f4f8fe;
}

.option-card:focus-visible {
  outline: 3px solid #1565c0;
  outline-offset: 3px;
}

.option-card.selected {
  border-color: #1565c0;
  background: #edf5ff;
}

/* Keep both images fully visible after the answer is locked. */
.option-card:disabled {
  opacity: 1;
  cursor: default;
}

.selection-label {
  display: block;
  min-height: 1.4em;
  margin-top: 8px;
  color: #12539d;
  font-weight: bold;
}

.feedback {
  max-width: 700px;
  margin: 24px auto 0;
  padding: 16px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 18px;
  line-height: 1.6;
}

.feedback.correct {
  background: #edf7ee;
  border-color: #43824b;
  color: #20592a;
}

.feedback.incorrect {
  background: #fff1f0;
  border-color: #bf5650;
  color: #922923;
}

.error-message {
  color: #922923;
}

.next-button {
  display: block;
  margin: 24px auto 0;
  padding: 10px 28px;
  font: inherit;
  cursor: pointer;
}

.next-button:disabled {
  cursor: default;
}

@media (max-width: 480px) {
  .options {
    gap: 10px;
  }

  .option-card {
    padding: 6px;
  }
}
</style>
