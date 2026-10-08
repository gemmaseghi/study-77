<template>
  <Screen>
    <div class="grid-trial">
      <h2>Round {{ roundNumber }}</h2>
      <p v-if="configurationError" class="error" role="alert">{{ configurationError }}</p>
      <template v-else>
        <section v-if="stage === 'selection'" aria-label="Choose your path">
          <p>Choose a path from the green cell to the yellow cell.</p>
          <div class="maze-frame">
            <img ref="mazeImage" :src="trial.maze_image" class="maze-image"
              alt="Maze: choose adjacent cells from green to yellow"
              crossorigin="anonymous" @load="imageReady = true" @error="imageFailed" />
            <div class="cell-overlay" :style="overlayStyle">
              <button v-for="cell in cells" :key="cell.key" type="button"
                class="maze-cell" :disabled="!imageReady || busy"
                :aria-label="cell.label" :aria-pressed="isSelected(cell.row, cell.col)"
                @click="selectCell(cell.row, cell.col)">
                <span v-if="isSelected(cell.row, cell.col)" class="dot"></span>
              </button>
            </div>
          </div>
          <p class="message" role="status" aria-live="polite">{{ errorMessage || (isComplete ? 'Path complete. Press Next to confirm, or Reset to start again.' : '\u00a0') }}</p>
          <div class="actions">
            <button type="button" :disabled="busy" @click="resetPath">Reset</button>
            <button v-if="isComplete" type="button" :disabled="busy" @click="confirmPath">{{ busy ? 'Saving…' : 'Next' }}</button>
          </div>
        </section>

        <section v-else-if="stage === 'feedback'" aria-label="Round feedback">
          <div class="comparison">
            <figure>
              <figcaption>Opponent’s path</figcaption>
              <img :src="trial.opponent_image" alt="Opponent’s completed path" @load="opponentReady = true" @error="opponentError = true" />
              <p v-if="opponentError" class="error">The opponent image could not be loaded. Please contact the researcher.</p>
              <p>This round: <strong>{{ signed(trial.opponent_score) }}</strong> points</p>
            </figure>
            <figure>
              <figcaption>Your path</figcaption>
              <img :src="pathPng" alt="Your confirmed path" />
              <p>This round: <strong>{{ signed(roundScore) }}</strong> points</p>
            </figure>
          </div>
          <h3>Total points</h3>
          <div class="scores">
            <div class="axis"><span>{{ -scoreLimit }}</span><span>0</span><span>{{ scoreLimit }}</span></div>
            <div v-for="score in scoreRows" :key="score.key" class="score-row">
              <div class="score-label">{{ score.label }}: <strong>{{ signed(score.value) }} points</strong></div>
              <div class="score-track" role="img" :aria-label="score.label + ': ' + score.value + ' total points'">
                <div class="score-fill" :style="barStyle(score)"></div>
                <span class="zero-line"></span>
              </div>
            </div>
          </div>
          <p v-if="isLast" class="winner">{{ winnerMessage }}</p>
          <button type="button" :disabled="!opponentReady || opponentError" @click="showConfidence">Next</button>
        </section>

        <section v-else-if="stage === 'confidence'" class="confidence">
          <h3><label :for="sliderId">How confident are you that you know the rules of the game?</label></h3>
          <div class="slider-wrap">
            <input :id="sliderId" v-model.number="confidence" type="range" min="0" max="100" step="1"
              :aria-valuetext="confidence + ' out of 100'" @input="confidenceTouched = true" />
            <div class="ticks" aria-hidden="true"><span v-for="tick in [0, 25, 50, 75, 100]" :key="tick">{{ tick }}</span></div>
            <div class="endpoints"><span>Not confident at all</span><span>Very confident</span></div>
          </div>
          <p>Selected value: <strong>{{ confidence }}</strong></p>
          <p>You can keep this value or adjust it before continuing.</p>
          <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
          <button type="button" :disabled="finished" @click="finishTrial">{{ isLast ? 'Finish game' : 'Next' }}</button>
        </section>
      </template>
    </div>
  </Screen>
</template>

<script>
export default {
  name: 'GridTrial',
  props: {
    trial: { type: Object, required: true },
    gameState: { type: Object, required: true },
    roundNumber: { type: Number, default: 1 },
    isLast: { type: Boolean, default: false },
    // Shared symmetric axis, expands if a total exceeds this bound.
    scoreAxisLimit: { type: Number, default: 50 }
  },
  data() {
    return {
      stage: 'selection', selectedPath: [], errorMessage: '', imageReady: false,
      busy: false, pathPng: '', roundScore: 0, participantTotal: 0, opponentTotal: 0,
      confidence: 50, confidenceInitial: 50, confidenceTouched: false,
      confidenceStarted: null, finished: false, opponentReady: false, opponentError: false
    };
  },
  computed: {
    configurationError() {
      const t = this.trial;
      const colours = ['green', 'yellow', 'white', 'orange', 'purple', 'violet'];
      if (!Array.isArray(t.maze) || !t.maze.length || !Array.isArray(t.maze[0]) || !t.maze[0].length) return 'Configuration error: missing maze matrix.';
      if (!t.maze.every(row => Array.isArray(row) && row.length === t.maze[0].length && row.every(c => colours.includes(c)))) return 'Configuration error: maze must be rectangular and contain supported colours.';
      const valid = p => Array.isArray(p) && p.length === 2 && p.every(Number.isInteger) && p[0] >= 0 && p[0] < t.maze.length && p[1] >= 0 && p[1] < t.maze[0].length;
      if (!valid(t.start) || !valid(t.end) || t.maze[t.start[0]][t.start[1]] !== 'green' || t.maze[t.end[0]][t.end[1]] !== 'yellow') return 'Configuration error: start/end must identify green/yellow cells.';
      const shortest = Math.abs(t.start[0] - t.end[0]) + Math.abs(t.start[1] - t.end[1]) + 1;
      if (t.min_cells !== shortest) return 'Configuration error: min_cells must include green and yellow. Expected ' + shortest + '.';
      if (!Number.isFinite(t.opponent_score) || !t.maze_image || !t.opponent_image) return 'Configuration error: missing images or opponent score.';
      if (![this.gameState.participant, this.gameState.opponent, this.gameState.confidence].every(Number.isFinite) || this.gameState.confidence < 0 || this.gameState.confidence > 100) return 'Configuration error: invalid shared game state.';
      const b = this.bounds;
      if (![b.x, b.y, b.width, b.height].every(Number.isFinite) || b.x < 0 || b.y < 0 || b.width <= 0 || b.height <= 0 || b.x + b.width > 1 || b.y + b.height > 1) return 'Configuration error: invalid grid_bounds.';
      return '';
    },
    bounds() { return this.trial.grid_bounds || { x: 0, y: 0, width: 1, height: 1 }; },
    cells() {
      return this.trial.maze.reduce((all, row, r) => all.concat(row.map((colour, c) => ({
        row: r, col: c, key: r + '-' + c, label: 'Row ' + (r + 1) + ', column ' + (c + 1) + ', ' + colour
      }))), []);
    },
    overlayStyle() {
      const b = this.bounds;
      return { left: b.x * 100 + '%', top: b.y * 100 + '%', width: b.width * 100 + '%', height: b.height * 100 + '%', gridTemplateColumns: 'repeat(' + this.trial.maze[0].length + ', 1fr)', gridTemplateRows: 'repeat(' + this.trial.maze.length + ', 1fr)' };
    },
    isComplete() {
      const last = this.selectedPath[this.selectedPath.length - 1];
      return !!last && last[0] === this.trial.end[0] && last[1] === this.trial.end[1];
    },
    scoreLimit() { return Math.max(10, this.scoreAxisLimit, Math.ceil(Math.max(Math.abs(this.participantTotal), Math.abs(this.opponentTotal)) / 10) * 10); },
    scoreRows() { return [{ key: 'opponent', label: 'Opponent', value: this.opponentTotal, colour: '#c62828' }, { key: 'participant', label: 'You', value: this.participantTotal, colour: '#1565c0' }]; },
    winnerMessage() { return this.participantTotal === this.opponentTotal ? 'The game is a tie!' : this.participantTotal > this.opponentTotal ? 'You win the game!' : 'Your opponent wins the game.'; },
    sliderId() { return 'maze-confidence-' + this.roundNumber + '-' + this.trial.trial_id; }
  },
  methods: {
    signed(n) { return n > 0 ? '+' + n : String(n); },
    isSelected(r, c) { return this.selectedPath.some(p => p[0] === r && p[1] === c); },
    imageFailed() { this.imageReady = false; this.errorMessage = 'The maze image could not be loaded. Please contact the researcher.'; },
    selectCell(r, c) {
      if (this.stage !== 'selection' || !this.imageReady || this.busy || this.configurationError) return;
      this.errorMessage = '';
      if (this.isSelected(r, c)) { this.errorMessage = 'You cannot visit the same cell twice.'; return; }
      if (this.isComplete) { this.errorMessage = 'Your path is complete. Press Next or Reset.'; return; }
      if (!this.selectedPath.length) {
        if (r !== this.trial.start[0] || c !== this.trial.start[1]) { this.errorMessage = 'You must start from the green cell.'; return; }
      } else {
        const last = this.selectedPath[this.selectedPath.length - 1];
        if (Math.abs(r - last[0]) + Math.abs(c - last[1]) !== 1) { this.errorMessage = 'You can only move to an adjacent cell.'; return; }
      }
      this.selectedPath.push([r, c]);
    },
    resetPath() {
      if (this.busy || this.stage !== 'selection') return;
      this.selectedPath = [];
      this.errorMessage = '';
    },
    makeSnapshot() {
      // Render the original maze + exactly the same dot centres/radius as the overlay.
      const img = this.$refs.mazeImage;
      if (!img || !img.naturalWidth) throw new Error('Image unavailable');
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const b = this.bounds;
      const cw = b.width * canvas.width / this.trial.maze[0].length;
      const ch = b.height * canvas.height / this.trial.maze.length;
      ctx.fillStyle = '#000000';
      this.selectedPath.forEach(([r, c]) => {
        ctx.beginPath();
        ctx.ellipse(b.x * canvas.width + (c + 0.5) * cw, b.y * canvas.height + (r + 0.5) * ch, cw * 0.18, ch * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      return canvas.toDataURL('image/png');
    },
    confirmPath() {
      if (!this.isComplete || this.busy || this.stage !== 'selection') return;
      this.busy = true;
      try {
        const png = this.makeSnapshot();
        const colours = this.selectedPath.map(([r, c]) => this.trial.maze[r][c]);
        const orange = colours.filter(c => c === 'orange').length;
        const purple = colours.filter(c => c === 'purple' || c === 'violet').length;
        const extra = Math.max(0, this.selectedPath.length - this.trial.min_cells);
        const score = orange * 2 - purple * 4 - extra;
        const participant = this.gameState.participant + score;
        const opponent = this.gameState.opponent + this.trial.opponent_score;
        this.$magpie.addTrialData({
          trial_type: 'maze_game', row_type: 'path', trial_id: this.trial.trial_id,
          round_number: this.roundNumber, selected_path: JSON.stringify(this.selectedPath),
          selected_colours: JSON.stringify(colours), maze: JSON.stringify(this.trial.maze),
          maze_image: this.trial.maze_image, opponent_image: this.trial.opponent_image,
          grid_bounds: JSON.stringify(this.bounds), participant_path_png: png,
          path_cells: this.selectedPath.length, min_cells: this.trial.min_cells,
          extra_cells: extra, orange_cells: orange, purple_cells: purple,
          participant_round_score: score, opponent_round_score: this.trial.opponent_score,
          participant_previous_total: this.gameState.participant, opponent_previous_total: this.gameState.opponent,
          participant_total: participant, opponent_total: opponent,
          is_last_trial: this.isLast,
          game_outcome: this.isLast ? (participant === opponent ? 'tie' : participant > opponent ? 'participant_wins' : 'opponent_wins') : ''
        });
        this.pathPng = png;
        this.roundScore = score;
        this.participantTotal = participant;
        this.opponentTotal = opponent;
        this.$emit('update-game', { participant, opponent, confidence: this.gameState.confidence });
        this.errorMessage = '';
        this.stage = 'feedback';
      } catch (error) {
        console.error('Maze confirmation failed:', error);
        this.errorMessage = 'Your path could not be saved. Please try again or contact the researcher.';
      } finally { this.busy = false; }
    },
    barStyle(score) {
      const width = Math.abs(score.value) / this.scoreLimit * 50;
      return { left: (score.value < 0 ? 50 - width : 50) + '%', width: width + '%', backgroundColor: score.colour };
    },
    showConfidence() {
      if (this.stage !== 'feedback' || !this.opponentReady || this.opponentError) return;
      // Read at activation: Magpie may mount later trial components in advance.
      this.confidence = this.gameState.confidence;
      this.confidenceInitial = this.confidence;
      this.confidenceStarted = Date.now();
      this.stage = 'confidence';
    },
    finishTrial() {
      if (this.finished || this.stage !== 'confidence') return;
      this.finished = true;
      try {
        this.$magpie.addTrialData({
          trial_type: 'maze_game', row_type: 'confidence', trial_id: this.trial.trial_id,
          round_number: this.roundNumber, confidence: this.confidence,
          confidence_initial: this.confidenceInitial, confidence_touched: this.confidenceTouched,
          confidence_rt_ms: Date.now() - this.confidenceStarted,
          participant_total: this.participantTotal, opponent_total: this.opponentTotal
        });
      } catch (error) {
        this.finished = false;
        this.errorMessage = 'Your response could not be saved. Please try again.';
        return;
      }
      this.$emit('update-game', { participant: this.participantTotal, opponent: this.opponentTotal, confidence: this.confidence });
      this.$magpie.nextScreen();
    }
  }
};
</script>

<style scoped>
.grid-trial { max-width: 940px; margin: 0 auto; padding: 16px; text-align: center; color: #202124; }
.grid-trial button { padding: 10px 24px; font: inherit; cursor: pointer; }
.grid-trial button:disabled { cursor: default; opacity: 0.55; }
.maze-frame { position: relative; width: min(100%, 420px); margin: 24px auto 0; line-height: 0; }
.maze-image { display: block; width: 100%; height: auto; }
.cell-overlay { display: grid; position: absolute; }
.grid-trial .maze-cell { position: relative; display: flex; justify-content: center; align-items: center; min-width: 0; min-height: 0; width: 100%; height: 100%; margin: 0; padding: 0; border: 0; border-radius: 0; background: transparent; box-shadow: none; appearance: none; }
.maze-cell:focus-visible { outline: 3px solid #1565c0; outline-offset: -4px; z-index: 1; }
.dot { position: absolute; width: 36%; height: 36%; border-radius: 50%; background: #000; pointer-events: none; }
.message { min-height: 2.7em; margin: 14px auto; max-width: 600px; }
.error { color: #a71919; }
.actions { display: flex; justify-content: center; gap: 16px; }
.comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.comparison figure { margin: 0; }
.comparison figcaption { font-weight: bold; margin: 10px 0; }
.comparison img { display: block; width: 100%; max-width: 360px; height: auto; margin: 0 auto; }
.scores { max-width: 640px; margin: 20px auto 30px; }
.axis { display: flex; justify-content: space-between; font-variant-numeric: tabular-nums; }
.score-row { margin: 14px 0; }
.score-label { text-align: left; margin-bottom: 6px; }
.score-track { position: relative; height: 30px; background: #edf0f3; border: 1px solid #b8bec5; }
.score-fill { position: absolute; top: 0; bottom: 0; }
.zero-line { position: absolute; left: 50%; top: -2px; bottom: -2px; width: 2px; transform: translateX(-1px); background: #202124; }
.winner { font-size: 1.2em; font-weight: bold; }
.confidence { max-width: 680px; margin: 50px auto; }
.slider-wrap { margin-top: 36px; }
.slider-wrap input { display: block; width: 100%; margin: 0; accent-color: #1565c0; cursor: pointer; }
.ticks { display: flex; justify-content: space-between; padding: 8px 7px 0; }
.endpoints { display: flex; justify-content: space-between; gap: 24px; margin-top: 14px; }
.endpoints span:first-child { text-align: left; }
.endpoints span:last-child { text-align: right; }
@media (max-width: 560px) { .comparison { grid-template-columns: 1fr; } .comparison img { max-width: 280px; } }
</style>