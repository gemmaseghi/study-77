<template>
  <Screen>
    <div class="instructions">
      <h2>{{ pages[page].title }}</h2>

      <div v-html="pages[page].text"></div>

      <div class="button-container">
        <button v-if="page > 0" @click="page--">
          indietro
        </button>

        <button v-if="page < pages.length - 1" @click="page++">
          Avanti
        </button>

        <button v-else @click="$magpie.nextScreen()">
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
          title: "Welcome!",
          text: `
            <p>
              In this experiment, you will play a game against another participant. The person who has collected more points at the end of the game, wins.
            </p>

            <p>
              In the game, you and the other participant will be shown a 4x4 grid. In the grid, one cell will be green, and that is the cell you must start from. Another cell will be yellow, and that is the cell you must reach. 
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/instr_minimal_before_adding_orange_empty.png"
                alt="Example of a grid with a green cell and a yellow cell."
                class="example-image"
              />

            <p>
              The goal of the game is to start from the green cell and reach the yellow one by collecting the highest amoung of points. There are, however, some rules. 
            </p>


          `
        },

        {
          title: "The rules",
          text: `
            <p>
              Let's understand the rules of the game! 

              First of all, you always need to start from the green cell and always need to reach the yellow cell. In order to select a path from the green cell to the yellow cell, you will have to click on the cells you want to visit. Once you click on a cell, a black dot will appear on it, so that you can see the path you have chosen. 
            </p>

            <p>
               To move through the grid, you can select only horizontally or vertically adjacent cells to the one you are in, which means that you are not allowed to move diagonally. Also, you cannot visit the same cell twice. 
            </p>

            <p>
              The first and second pictures from the left show correct ways of going from the green cell to the yellow cell, while the last picture on the right shows an incorrect way of going from the green cell to the yellow cell. 
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/correct_and_wrong_movements.png"
                alt="Example of correct and incorrect moves"
                class="example-image"
              />

              <p>
                If you try to make an incorrect move, you will see an error message and you will have to select a different cell.
              </p>

              <p>
                We will then look at how the points are calculated, and how you can maximize your score.
              </p>
            
          `
        },

        {
          title: "The points",
          text: `
            <p>
              The first thing you need to know about the points is that everytime you select one cell more than what is minimally needed to reach the yellow cell, you will lose a point. For example, if the minimum number of cells needed to reach the yellow cell is 3, and you select 4 cells, you will lose 1 point. If you select 5 cells, you will lose 2 points, and so on.
            </p>

            <p>
              In every grid, there are many possible paths that connect the green cell to the yellow cell. For example, in the grid below, the minimum number of cells needed to reach the yellow cell (excluding the green and the yellow cells themselves) is 4. 
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/example_for_minimal_path.png"
                alt="Empty cell to illustrate minimal path"
                class="example-image"
              />

            <p>
              Below, in the first and second pictures from the left, you can see two possible minimal paths that connect the green and the yellow cell. In those cases, you will lose 0 points, because you have used the minimally needed number of cells. On the far right instead, you can see a possible path that uses 9 cells to go from the green one to the yellow one. In that case, you will lose 5 points, because you have used 5 cells more than the minimally needed number of cells. 
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/points_for_minimal_path.png"
                alt="Illustration of minimal versus non minimal paths"
                class="example-image"
              />

          `
        },

        {
          title: "The points",
          text: `
            <p>
              So, you try not to lose points by selecting a minimal path. But how exactly can you make points? In the grid, apart from the green and the yellow cell, there are also some orange cells. For every orange cell you select, you will gain 2 points. 
            </p>

            <p>
              Let's take a look at the grid below. The minimum number of cells needed to reach the yellow cell is 3. However, there are different paths with 3 cells that you can select. 
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/instr_orange_empty.png"
                alt="Empty cell to illustrate the presence of orange cells"
                class="example-image"
              />

            <p>
              Below, you can see two possible paths with 3 cells selected. However, the first path does not include any orange cell, while the second path includes one. In the first case, you will gain 0 points, while in the second case you will gain 2 points.
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/orange_points_example.png"
                alt="Different points with and without selecting orange cells"
                class="example-image"
              />

            <p>
              You will now have the opportunity to practice by choosing among two possible paths for a specific grid. This is to make sure that you have understood how to maximize the points. 
            </p>

          `
        },

        {
          title: "First practice",
          text: `
            <p>
              You will now have the opportunity to practice by choosing among two possible paths for a specific grid. This is to make sure that you have understood how to maximize your points. 
            </p>

            <p>
              You will see a grid at the top of the page, like this one: 
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/forced_choice_example_empty.png"
                alt="Empty cell for forced choice"
                class="example-image"
              />

            <p>
              Then, at the bottom of the page you will see two possible paths from the green to the yellow cell, called Option A and Option B. You need to click on the option that would maximize your points in the game. 
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/forced_choice_possible_paths.png"
                alt="Possible paths for forced choice"
                class="example-image"
              />
            
            <p>
              In the example above, Option B is the correct choice, because it makes you gain 2 points, while Option A makes you gain 0 points.
            </p>

            <p>
              Click on "Next" to start the practice. You will have to do two rounds of this forced choice practice. After that, you will be ready to start the real game!
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
  max-width: 650px;
  width: auto;
  height: auto;
  margin: 0 auto;
}

.instructions :deep(.example-image) {
  display: block;
  max-width: 650px;
  width: auto;
  height: auto;
  margin: 24px auto;
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