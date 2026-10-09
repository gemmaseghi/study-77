<template>
  <Screen>
    <div class="instructions">
      <h2>{{ pages[page].title }}</h2>

      <div v-html="pages[page].text"></div>

      <div class="button-container">
        <button v-if="page > 0" @click="page--">
          Previous
        </button>

        <button v-if="page < pages.length - 1" @click="page++">
          Next
        </button>

        <button v-else @click="$magpie.nextScreen()">
          Next
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
          title: "Welcome!",
          text: `
            <p>
              In this experiment, you will play against another participant.
              <strong>The player with the most points at the end wins.</strong>
            </p>

            <p>
              In each round, you will see a <strong>4 × 4 grid</strong>. 
              In the grid, <strong>one cell will be green</strong>, and that is the cell you must start from. 
              <strong>Another cell will be yellow</strong>, and that is the cell you must reach. 
              
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/instr_minimal_before_adding_orange_empty.png"
                alt="A grid with a green starting cell and a yellow destination cell."
                class="example-image small-image"
              />
            </div>

            <p>
              Your goal is to reach the yellow cell while <strong>earning as many points as possible</strong>.
              The following pages will explain how to move and how points are calculated.
            </p>
          `
        },

        {
          title: "Legal moves",
          text: `
            <p>
              <strong>Click on the green cell to start</strong>, then click on each
              cell you want to visit until you reach the yellow cell.
              A <strong>black dot</strong> will mark each selected cell.
            </p>

            <p>
              Each move must take you to a cell immediately <strong>above, below, to the left, or to the right</strong> of your current cell.
              <strong>Diagonal moves are not allowed</strong>, and you <strong>cannot visit the same cell twice</strong>.
            </p>

            <p>
              In the example below, the <strong>first two paths from the left are valid</strong>, while the <strong>third path is invalid</strong>.
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/correct_and_wrong_movements.png"
                alt="Two valid paths and one invalid path with a diagonal move."
                class="example-image"
              />
            </div>

            <p>
              If you try to make an invalid move, an error message will appear.
              That cell will not be selected, and you will have to click on another one. 
            </p>
          `
        },

        {
          title: "Points: extra cells",
          text: `
            <p>
              The first thing you need to know about the points is that you lose <strong>1 point for every extra cell</strong> you visit beyond the shortest possible path from green to yellow. 
              For example, a path with <strong>one extra cell costs 1 point</strong>, a path with <strong>two extra cells costs 2 points</strong>, and so on.
            </p>

            <p>
              In every grid, there are many possible paths of different lengths that connect the green cell to the yellow cell. In the grid below, the minimum number of cells from green to yellow (excluding the green and the yellow cells themselves) is 5. 
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/example_for_minimal_path.png"
                alt="A grid used to compare shorter and longer paths."
                class="example-image small-image"
              />
            </div>

            <p>
              Below, the <strong>first two paths from the left are both shortest paths</strong>, so neither receives an extra-cell penalty.
              The <strong>third path however uses four extra cells</strong>, so it would cost <strong> -4 points</strong>.
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/points_for_minimal_path.png"
                alt="Two shortest paths and a longer path with four extra cells."
                class="example-image"
              />
            </div>

          `
        },

        {
          title: "Points: orange cells",
          text: `
            <p>
              We just saw that you won't lose points by selecting a minimal path. But how exactly can you make points? In the grids, apart from the green and the yellow cells, there will also be some orange cells.
              You gain <strong>2 points for every orange cell</strong> you visit.
            </p>

            <p>
              This means that paths of the same length can earn <strong>different numbers of points</strong>.
              Consider the grid below: the minimum number of cells from green to yellow is 3, however, there are different paths with 3 cells that you can select. 
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/instr_orange_empty.png"
                alt="A grid containing an orange cell."
                class="example-image small-image"
              />
            </div>

            <p>
              Below, you can see two possible paths with 3 cells selected. Both paths are shortest paths, so neither receives an extra-cell penalty.
              However, the <strong>first path contains no orange cells and thus earns 0 points</strong>.
              The <strong>second one, on the other hand, includes one orange cell and thus earns 2 points</strong>.
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/orange_points_example.png"
                alt="Two shortest paths: one earns zero points and the other earns two."
                class="example-image"
              />
            </div>

          `
        },

        {
          title: "First practice",
          text: `
            <p>
              You will now complete <strong>two practice rounds</strong>.
              In each round, choose the path that would earn
              <strong>the most points</strong>.
            </p>

            <p>
              An <strong>empty grid will appear at the top</strong> of the page:
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/forced_choice_example_empty.png"
                alt="An empty grid for a practice round."
                class="example-image small-image"
              />
            </div>

            <p>
              Below it, you will see two possible paths:
              <strong>Option A</strong> and <strong>Option B</strong>.
              <strong>Click the option that earns more points.</strong>
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/forced_choice_possible_paths.png"
                alt="Option A earns zero points; Option B earns two points."
                class="example-image"
              />
            </div>

            <p>
              In this example, <strong>Option B is correct</strong>:
              it earns <strong>2 points</strong>, while Option A earns
              <strong>0 points</strong>.
            </p>

            <p>
              Click on "Next" to start the practice. After that, you will be ready to start the real game!
            </p>
          `
        },
      ]
    };
  }
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

.instructions :deep(p) {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.instructions :deep(.instruction-figure) {
  width: 100%;
  margin: 24px auto;
  text-align: center;
}

.instructions :deep(.image-caption) {
  width: 100%;
  margin: 0 auto 10px;
  text-align: center;
  font-weight: bold;
}

.instructions :deep(.instruction-image) {
  display: block;
  max-width: 600px;
  width: auto;
  height: auto;
  margin: 0 auto;
}

.instructions :deep(.example-image) {
  display: block;
  width: auto;
  max-width: min(600px, 100%);
  height: auto;
  margin: 24px auto;
}

/* Only images explicitly marked as small-image are reduced. */
.instructions :deep(.example-image.small-image) {
  max-width: min(300px, 100%);
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

</style>