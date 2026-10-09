<template>
  <Screen>
    <div class="instructions">
      <h2>{{ pages[page].title }}</h2>

      <div v-html="pages[page].text"></div>

      <div class="button-container">
        <button v-if="page > 0" @click="previousPage">
          Indietro
        </button>

        <button
          v-if="page < pages.length - 1"
          @click="pageForward"
        >
          Avanti
        </button>

        <button
          v-else
          @click="pageForward"
        >
          Avanti
        </button>
      </div>
    </div>
  </Screen>
</template>

<script>
export default {
  name: "InstructionsWithBack",
  data() {
    return {
      page: 0,
      pages: [
        {
          title: "The real game",
          text: `
            <p>
              You are now ready to play against another participant!
              <strong>The player who has collected more points at the end of the game, wins</strong>.
            </p>

            <p>
              The game consists of <strong>16 rounds</strong>.
              In each round, you will see a <strong>4 × 4 grid</strong>.
              Select a path from the <strong>green cell to the yellow cell</strong>,
              following the rules you have learned.
            </p>

            <p>
              If you make a mistake or want to change your path, click
              <strong>Reset</strong> to clear your selection and start again.
            </p>

            <p>
              The <strong>Next</strong> button will appear once you reach the yellow cell.
              When you are satisfied with your path, click <strong>Next</strong>
              to confirm it. <strong>You cannot change your path after confirming it.</strong>
            </p>
          `
        },

        {
          title: "The real game",
          text: `

            <p>
              After confirming your path, you will see <strong>your path and the other participant's chosen path side by side</strong>,
              together with the points each of you earned or lost in that round.
            </p>


            <p>
              Below the images, two bars show your <strong>total points so far</strong>:
              the <strong>top bar, in red, shows the other participant's total</strong>,
              while the <strong>bottom bar, in blue, shows your total</strong>.
              Each round's points are added to or subtracted from the previous total.
            </p>
            </p>

            <p>
              Once you have seen the current score, in the following screen, you will be asked to express a rating on a slider from 0 to 100. In the first round, the slider starts at <strong>50</strong>.
              In later rounds, it starts at <strong>your previous rating</strong>. <strong>You must move the slider in every round.</strong>
              If you want to keep your previous rating, move the slider away from that value and then move it back before clicking Next.
            </p>

            <p>
              At the end of the game, you will see who won and complete a short questionnaire. 
            </p>

            <p>
              Have fun and good luck!
            </p>


          `
        },
      ]
    };
  },

  methods: {

    previousPage() {
      this.page--;
    },

    pageForward() {
      if (this.page < this.pages.length - 1) {
        this.page++;
      } else {
        this.$magpie.nextScreen();
      }
    }
  },
};
</script>

<style scoped>
.instructions {
  width: 700px;
  max-width: 95vw;
  margin: 0 auto;
  text-align: justify;
}

.instructions h2 {
  text-align: center;
}

.instructions p {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 12px;
}


.button-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.button-container button {
  width: auto;
  margin: 0 5px;
}


.image-caption {
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}


.instructions :deep(.instruction-figure) {
  text-align: center;
  margin: 8px 0;
}

.instructions :deep(.example-image) {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: 500px;
  height: auto;
  margin: 24px auto;
  object-fit: contain;
}


</style>