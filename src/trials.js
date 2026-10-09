const trials = [
{
    trial_id: 1,

    maze: [
      ["purple",  "white", "white", "purple"],
      ["green", "white", "orange", "white"],
      ["white",  "white", "orange", "yellow"],
      ["orange", "white", "white", "white"]
    ],

    start: [1, 0],
    end: [2, 3],

    min_cells: 5,

    opponent_score: 4, 

    maze_image: "stimuli/maze_1_todo.png",
    opponent_image: "stimuli/maze_1_done.png",
  },

{
    trial_id: 2,

    maze: [
      ["purple",  "white", "orange", "orange"],
      ["white", "purple", "white", "white"],
      ["white",  "white", "white", "white"],
      ["green", "white", "orange", "yellow"]
    ],

    start: [3, 0],
    end: [3, 3],

    min_cells: 4,

    opponent_score: 2, 

    maze_image: "stimuli/maze_2_todo.png",
    opponent_image: "stimuli/maze_2_done.png",
  },

{
    trial_id: 3,

    maze: [
      ["purple",  "white", "white", "purple"],
      ["white", "white", "orange", "yellow"],
      ["green",  "orange", "white", "white"],
      ["purple", "white", "white", "orange"]
    ],

    start: [2, 0],
    end: [1, 3],

    min_cells: 5,

    opponent_score: 4, 

    maze_image: "stimuli/maze_3_todo.png",
    opponent_image: "stimuli/maze_3_done.png",
  },

{
    trial_id: 4,

    maze: [
      ["white",  "white", "yellow", "purple"],
      ["white", "white", "white", "white"],
      ["orange",  "white", "white", "white"],
      ["green", "orange", "orange", "purple"]
    ],

    start: [3, 0],
    end: [0, 2],

    min_cells: 6,

    opponent_score: 4, 

    maze_image: "stimuli/maze_4_todo.png",
    opponent_image: "stimuli/maze_4_done.png",
  },

{
    trial_id: 5,

    maze: [
      ["white",  "orange", "orange", "white"],
      ["green", "white", "white", "white"],
      ["purple",  "white", "white", "yellow"],
      ["white", "purple", "white", "orange"]
    ],

    start: [1, 0],
    end: [2, 3],

    min_cells: 5,

    opponent_score: 2, 

    maze_image: "stimuli/maze_5_todo.png",
    opponent_image: "stimuli/maze_5_done.png",
  },

{
    trial_id: 6,

    maze: [
      ["orange",  "white", "white", "purple"],
      ["purple", "white", "white", "yellow"],
      ["white",  "white", "orange", "white"],
      ["green", "white", "white", "orange"]
    ],

    start: [3, 0],
    end: [1, 3],

    min_cells: 6,

    opponent_score: 2, 

    maze_image: "stimuli/maze_6_todo.png",
    opponent_image: "stimuli/maze_6_done.png",
  },

{
    trial_id: 7,

    maze: [
      ["green",  "white", "white", "white"],
      ["purple", "white", "purple", "orange"],
      ["white",  "white", "white", "orange"],
      ["orange", "purple", "white", "yellow"]
    ],

    start: [0, 0],
    end: [3, 3],

    min_cells: 7,

    opponent_score: 4, 

    maze_image: "stimuli/maze_7_todo.png",
    opponent_image: "stimuli/maze_7_done.png",
  },

{
    trial_id: 8,

    maze: [
      ["white",  "orange", "orange", "purple"],
      ["white", "white", "white", "white"],
      ["green",  "purple", "white", "yellow"],
      ["white", "orange", "white", "purple"]
    ],

    start: [2, 0],
    end: [2, 3],

    min_cells: 4,

    opponent_score: 0, 

    maze_image: "stimuli/maze_8_todo.png",
    opponent_image: "stimuli/maze_8_done.png",
  },

{
    trial_id: 9,

    maze: [
      ["green",  "white", "white", "white"],
      ["white", "orange", "white", "white"],
      ["purple",  "white", "white", "orange"],
      ["purple", "white", "white", "yellow"]
    ],

    start: [0, 0],
    end: [3, 3],

    min_cells: 7,

    opponent_score: 4, 

    maze_image: "stimuli/maze_9_todo.png",
    opponent_image: "stimuli/maze_9_done.png",
  },

{
    trial_id: 10,

    maze: [
      ["green",  "white", "purple", "yellow"],
      ["white", "white", "white", "white"],
      ["white",  "white", "purple", "white"],
      ["purple", "orange", "white", "orange"]
    ],

    start: [0, 0],
    end: [0, 3],

    min_cells: 4,

    opponent_score: -2, 

    maze_image: "stimuli/maze_10_todo.png",
    opponent_image: "stimuli/maze_10_done.png",
  },

{
    trial_id: 11,

    maze: [
      ["orange",  "white", "orange", "purple"],
      ["white", "white", "white", "white"],
      ["white",  "white", "white", "white"],
      ["green", "orange", "purple", "yellow"]
    ],

    start: [3, 0],
    end: [3, 3],

    min_cells: 4,

    opponent_score: 0, 

    maze_image: "stimuli/maze_11_todo.png",
    opponent_image: "stimuli/maze_11_done.png",
  },
  
{
    trial_id: 12,

    maze: [
      ["purple",  "white", "green", "white"],
      ["orange", "white", "orange", "white"],
      ["white",  "white", "white", "orange"],
      ["purple", "purple", "white", "yellow"]
    ],

    start: [0, 2],
    end: [3, 3],

    min_cells: 5,

    opponent_score: 4, 

    maze_image: "stimuli/maze_12_todo.png",
    opponent_image: "stimuli/maze_12_done.png",
  },

{
    trial_id: 13,

    maze: [
      ["orange",  "green", "purple", "orange"],
      ["white", "white", "white", "purple"],
      ["white",  "white", "purple", "yellow"],
      ["white", "white", "orange", "white"]
    ],

    start: [0, 1],
    end: [2, 3],

    min_cells: 5,

    opponent_score: 0, 

    maze_image: "stimuli/maze_13_todo.png",
    opponent_image: "stimuli/maze_13_done.png",
  },

{
    trial_id: 14,

    maze: [
      ["purple",  "white", "yellow", "orange"],
      ["white", "white", "orange", "purple"],
      ["white",  "orange", "white", "white"],
      ["green", "white", "white", "purple"]
    ],

    start: [3, 0],
    end: [0, 2],

    min_cells: 6,

    opponent_score: 4, 

    maze_image: "stimuli/maze_14_todo.png",
    opponent_image: "stimuli/maze_14_done.png",
  },

{
    trial_id: 15,

    maze: [
      ["white",  "white", "white", "white"],
      ["green", "orange", "white", "orange"],
      ["white",  "white", "white", "yellow"],
      ["purple", "white", "white", "purple"]
    ],

    start: [1, 0],
    end: [2, 3],

    min_cells: 5,

    opponent_score: 4, 

    maze_image: "stimuli/maze_15_todo.png",
    opponent_image: "stimuli/maze_15_done.png",
  },

{
    trial_id: 16,

    maze: [
      ["green",  "white", "purple", "orange"],
      ["purple", "white", "white", "yellow"],
      ["white",  "white", "purple", "white"],
      ["orange", "white", "white", "orange"]
    ],

    start: [0, 0],
    end: [1, 3],

    min_cells: 5,

    opponent_score: 0, 

    maze_image: "stimuli/maze_16_todo.png",
    opponent_image: "stimuli/maze_16_done.png",
  },

];

export default trials;
