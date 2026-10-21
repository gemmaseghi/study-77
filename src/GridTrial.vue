<template>
  <Screen>
    <div class="grid-trial">
      <h2>Round {{ roundNumber }}</h2>
      <p v-if="configurationError" class="error" role="alert">{{ configurationError }}</p>
      <template v-else>
        <section v-if="stage === 'selection'" aria-label="Choose your path">
          <p v-if="testingPath"><strong>Test mode:</strong> choose a path, then click Check score. It will not be submitted.</p>
          <p v-else>Choose a path from the green cell to the yellow cell.</p>
          <div class="maze-with-help">

            <!-- Left: test a path's score -->
            <div class="help-side">
              <button
                v-if="!testingPath"
                type="button"
                class="help-button"
                :disabled="!imageReady || busy"
                @click="startScoreTest"
              >
                {{ scoreCheckPrice === 0
                  ? 'Use one free token'
                  : 'Use one point' }}
                to try out the score for this round
              </button>
            </div>

            <!-- Centre: your existing grid -->
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

            <!-- Right: review the instructions -->
            <div class="help-side">
              <button
                v-if="!testingPath"
                type="button"
                class="help-button"
                :disabled="!imageReady || busy"
                @click="openRules"
              >
                {{ instructionsPrice === 0
                  ? 'Use one free token'
                  : 'Use one point' }}
                to see the instructions again
              </button>
            </div>

          </div>
          <p class="grid-message" role="status" aria-live="polite">{{ errorMessage || (isComplete ? (testingPath ? 'Path complete. Click Check score to test it.' : 'Path complete. Press Next to confirm, or Reset to start again.') : '\u00a0') }}</p>
          <div class="actions">
            <button type="button" :disabled="busy" @click="resetPath">Reset</button>
            <button v-if="isComplete && !testingPath" type="button" :disabled="busy" @click="confirmPath">{{ busy ? 'Saving…' : 'Next' }}</button>
            <button v-if="testingPath && isComplete" type="button" :disabled="busy" @click="checkScore">Check score</button>
            <button v-if="testingPath" type="button" :disabled="busy" @click="cancelScoreTest">Cancel test</button>
          </div>
          <p v-if="testingPath">Checking this path costs {{ scoreCheckPrice === 0 ? 'your free score-check token' : '1 point' }}. Cancelling before checking is free.</p>
          <p v-if="helpCost > 0">Help costs this round: <strong>{{ helpCost }} point(s)</strong>. These will be deducted when you confirm your final path.</p>
        </section>
        <section v-else-if="stage === 'rules'" aria-label="Rules summary">
          <RuleSummary />
          <p>This review used {{ lastRuleUseWasFree ? 'your free instructions token' : '1 point' }}.</p>
          <button type="button" @click="closeRules">Return to the game</button>
        </section>

        <section v-else-if="stage === 'test-result'" aria-label="Test score">
          <h3>Test result</h3>
          <div class="maze-frame">
            <img :src="trial.maze_image" class="maze-image" alt="Tested path" />
            <div class="cell-overlay" :style="overlayStyle">
              <div v-for="cell in cells" :key="cell.key" class="test-cell">
                <span v-if="isSelected(cell.row, cell.col)" class="dot"></span>
              </div>
            </div>
          </div>
          <p>This path earns <strong>{{ signed(testResult.score) }} points</strong> before help costs.</p>
          <p>Help costs so far this round: <strong>{{ helpCost }} point(s)</strong>.</p>
          <p><strong>This was only a test. Now select the path you want to submit for this round.</strong></p>
          <button type="button" @click="endScoreTest">Select my final path</button>
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
              <p>Path score: <strong>{{ signed(pathScore) }}</strong> points</p>
              <p>Help costs: <strong>{{ helpCost }}</strong> point(s)</p>
              <p>This round: <strong>{{ signed(roundScore) }}</strong> points</p>
            </figure>
          </div>
          <h3>Total points</h3>
          <div class="scores">
            <div class="axis"><span>0</span></div>
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
          <h3><label :for="sliderId">How confident are you in {{ instructorName ? instructorName + '’s' : 'your instructor’s' }} explanation of the rules?</label></h3>
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
import RuleSummary from "./RuleSummary.vue";
export default {
  name: 'GridTrial',
  components: { RuleSummary },
  props: {
    instructorName: { type: String, default: '' },
    trial: { type: Object, required: true },
    gameState: { type: Object, required: true },
    roundNumber: { type: Number, default: 1 },
    isLast: { type: Boolean, default: false },
    // Shared symmetric axis, expands if a total exceeds this bound.
    scoreAxisLimit: { type: Number, default: 50 }
  },
  data() {
    return {
      stage: 'selection',
      testingPath: false,
      testResult: null,
      rulesOpenedAt: null,
      instructionsUses: 0,
      scoreCheckUses: 0,
      instructionsCost: 0,
      scoreCheckCost: 0,
      helpEvents: [],
      redSelections: [],
      firstRedSelection: null,
      pathScore: 0, selectedPath: [], errorMessage: '', imageReady: false,
      busy: false, pathPng: '', roundScore: 0, participantTotal: 0, opponentTotal: 0,
      confidence: 50, confidenceInitial: 50, confidenceTouched: false,
      confidenceStarted: null, finished: false, opponentReady: false, opponentError: false
    };
  },
  computed: {
    instructionsPrice() { return this.gameState.instructionsFreeTokenUsed ? 1 : 0; },
    scoreCheckPrice() { return this.gameState.scoreFreeTokenUsed ? 1 : 0; },
    helpCost() { return this.instructionsCost + this.scoreCheckCost; },
    lastRuleUseWasFree() {
      const uses = this.helpEvents.filter(e => e.event === 'instructions_opened');
      return uses.length > 0 && uses[uses.length - 1].cost === 0;
    },
    configurationError() {
      const t = this.trial;
      const colours = ['green', 'yellow', 'white', 'orange', 'purple', 'blue', 'red'];
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
    // Costs are separate from path points: a test never changes the total.
    scorePath(path) {
      const colours = path.map(([r, c]) => this.trial.maze[r][c]);
      const orange = colours.filter(c => c === 'orange').length;
      const purple = colours.filter(c => c === 'purple').length;
      const extra = Math.max(0, path.length - this.trial.min_cells);
      return { colours, orange, purple, extra, score: 2 * orange - 4 * purple - extra };
    },

    recordHelpEvent(event, extra = {}) {
      const entry = {
        event,
        event_index: this.helpEvents.length + 1,
        event_time_ms: Date.now(),
        ...extra
      };
      // Immediate event rows retain the order and timing of help-seeking.
      this.$magpie.addTrialData({
        trial_type: 'maze_game', row_type: 'help_event',
        trial_id: this.trial.trial_id, round_number: this.roundNumber,
        ...entry
      });
      this.helpEvents.push(entry);
      return entry;
    },

    openRules() {
      if (this.stage !== 'selection' || this.testingPath || this.busy || !this.imageReady) return;
      const cost = this.instructionsPrice;
      const entry = this.recordHelpEvent('instructions_opened', {
        cost,
        free_token_used: cost === 0,
        use_number_this_trial: this.instructionsUses + 1,
        use_number_game: (this.gameState.instructionsUsesTotal || 0) + 1,
        path_at_request: JSON.stringify(this.selectedPath)
      });
      this.instructionsUses += 1;
      this.instructionsCost += cost;
      this.rulesOpenedAt = entry.event_time_ms;
      this.$emit('update-game', {
        ...this.gameState,
        instructionsFreeTokenUsed: true,
        instructionsUsesTotal: (this.gameState.instructionsUsesTotal || 0) + 1
      });
      this.stage = 'rules';
    },

    closeRules() {
      if (this.stage !== 'rules') return;
      this.recordHelpEvent('instructions_closed', {
        duration_ms: Date.now() - this.rulesOpenedAt
      });
      // The in-progress path is preserved when reviewing the rules.
      this.rulesOpenedAt = null;
      this.stage = 'selection';
    },

    startScoreTest() {
      if (this.stage !== 'selection' || this.testingPath || this.busy || !this.imageReady) return;
      this.recordHelpEvent('score_test_started', {
        quoted_cost: this.scoreCheckPrice,
        path_at_request: JSON.stringify(this.selectedPath)
      });
      this.testingPath = true;
      this.errorMessage = '';
    },

    cancelScoreTest() {
      if (!this.testingPath || this.stage !== 'selection' || this.busy) return;
      this.recordHelpEvent('score_test_cancelled');
      this.testingPath = false;
      this.errorMessage = '';
    },

    checkScore() {
      if (!this.testingPath || !this.isComplete || this.stage !== 'selection' || this.busy) return;
      const details = this.scorePath(this.selectedPath);
      const cost = this.scoreCheckPrice;
      this.recordHelpEvent('score_checked', {
        cost,
        free_token_used: cost === 0,
        use_number_this_trial: this.scoreCheckUses + 1,
        use_number_game: (this.gameState.scoreChecksTotal || 0) + 1,
        tested_path: JSON.stringify(this.selectedPath),
        tested_colours: JSON.stringify(details.colours),
        tested_path_cells: this.selectedPath.length,
        tested_orange_cells: details.orange,
        tested_purple_cells: details.purple,
        tested_stepped_on_purple: details.purple > 0,
        tested_extra_cells: details.extra,
        tested_path_score: details.score,
        help_cost_after_check: this.helpCost + cost,
        tested_net_score: details.score - this.helpCost - cost
      });
      this.scoreCheckUses += 1;
      this.scoreCheckCost += cost;
      this.testResult = details;
      this.$emit('update-game', {
        ...this.gameState,
        scoreFreeTokenUsed: true,
        scoreChecksTotal: (this.gameState.scoreChecksTotal || 0) + 1
      });
      this.stage = 'test-result';
    },

    endScoreTest() {
      if (this.stage !== 'test-result') return;
      this.recordHelpEvent('score_result_closed');
      this.testingPath = false;
      this.testResult = null;
      this.selectedPath = [];
      this.stage = 'selection';
      this.errorMessage = 'Now select the path you want to submit for this round, starting from green.';
    },

    signed(n) { return n > 0 ? '+' + n : String(n); },
    isSelected(r, c) { return this.selectedPath.some(p => p[0] === r && p[1] === c); },
    imageFailed() { this.imageReady = false; this.errorMessage = 'The maze image could not be loaded. Please contact the researcher.'; },
    selectCell(r, c) {
      if (this.stage !== 'selection' || !this.imageReady || this.busy || this.configurationError) return;
      this.errorMessage = '';
      if (this.isSelected(r, c)) { this.errorMessage = 'You cannot visit the same cell twice.'; return; }
      if (this.isComplete) { this.errorMessage = this.testingPath ? 'Your path is complete. Click Check score or Reset.' : 'Your path is complete. Press Next or Reset.'; return; }
      if (!this.selectedPath.length) {
        if (r !== this.trial.start[0] || c !== this.trial.start[1]) { this.errorMessage = 'You must start from the green cell.'; return; }
      } else {
        const last = this.selectedPath[this.selectedPath.length - 1];
        if (Math.abs(r - last[0]) + Math.abs(c - last[1]) !== 1) { this.errorMessage = 'You can only move to an adjacent cell.'; return; }
      }
      this.selectedPath.push([r, c]);
      if (this.trial.maze[r][c] === 'red') {
        this.recordRedSelection(r, c);
      }
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
      if (!this.isComplete || this.testingPath || this.busy || this.stage !== 'selection') return;
      this.busy = true;
      try {
        const png = this.makeSnapshot();
        const details = this.scorePath(this.selectedPath);
        const { colours, orange, purple, extra } = details;
        const score = details.score - this.helpCost;
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
          stepped_on_purple: purple > 0,
          // All valid red selections during this round.
          red_selection_count: this.redSelections.length,

          red_test_selection_count: this.redSelections.filter(
            selection => selection.mode === 'test'
          ).length,

          red_main_selection_count: this.redSelections.filter(
            selection => selection.mode === 'main'
          ).length,

          red_selections_json: JSON.stringify(this.redSelections),

          // Red cells in the final submitted path only.
          red_cells_final: colours.filter(
            colour => colour === 'red'
          ).length,

          // First red selection within this round.
          first_red_timestamp_ms: this.firstRedSelection
            ? this.firstRedSelection.timestamp_ms
            : null,

          first_red_mode: this.firstRedSelection
            ? this.firstRedSelection.mode
            : null,

          // First red selection across the entire game.
          first_red_game_round: this.gameState.firstRedSelection
            ? this.gameState.firstRedSelection.round_number
            : null,

          first_red_game_trial_id: this.gameState.firstRedSelection
            ? this.gameState.firstRedSelection.trial_id
            : null,

          first_red_game_timestamp_ms: this.gameState.firstRedSelection
            ? this.gameState.firstRedSelection.timestamp_ms
            : null,

          first_red_game_mode: this.gameState.firstRedSelection
            ? this.gameState.firstRedSelection.mode
            : null,
          participant_path_score: details.score,
          instructions_uses: this.instructionsUses,
          score_check_uses: this.scoreCheckUses,
          instructions_cost: this.instructionsCost,
          score_check_cost: this.scoreCheckCost,
          help_cost_total: this.helpCost,
          instructions_uses_total: this.gameState.instructionsUsesTotal || 0,
          score_check_uses_total: this.gameState.scoreChecksTotal || 0,
          instructions_free_token_used: !!this.gameState.instructionsFreeTokenUsed,
          score_free_token_used: !!this.gameState.scoreFreeTokenUsed,
          help_events_json: JSON.stringify(this.helpEvents),
          participant_round_score: score, opponent_round_score: this.trial.opponent_score,
          participant_previous_total: this.gameState.participant, opponent_previous_total: this.gameState.opponent,
          participant_total: participant, opponent_total: opponent,
          is_last_trial: this.isLast,
          game_outcome: this.isLast ? (participant === opponent ? 'tie' : participant > opponent ? 'participant_wins' : 'opponent_wins') : ''
        });
        this.pathPng = png;
        this.pathScore = details.score;
        this.roundScore = score;
        this.participantTotal = participant;
        this.opponentTotal = opponent;
        this.$emit('update-game', { ...this.gameState, participant, opponent, confidence: this.gameState.confidence });
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
      this.$emit('update-game', { ...this.gameState, participant: this.participantTotal, opponent: this.opponentTotal, confidence: this.confidence });
      this.$magpie.nextScreen();
    },
    recordRedSelection(row, col) {
      const selection = {
        trial_id: this.trial.trial_id,
        round_number: this.roundNumber,

        row,
        col,

        timestamp_ms: Date.now(),

        // Distinguish score testing from ordinary path selection.
        mode: this.testingPath ? 'test' : 'main',

        selection_number: this.redSelections.length + 1
      };

      // Keep every valid red selection in this round.
      this.redSelections.push(selection);

      // Remember the first red selection in this round.
      if (this.firstRedSelection === null) {
        this.firstRedSelection = { ...selection };
      }

      // Remember the first red selection across the entire game.
      if (this.gameState.firstRedSelection == null) {
        this.$emit('update-game', {
          ...this.gameState,
          firstRedSelection: { ...selection }
        });
      }
    },
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
.grid-trial .grid-message { min-height: 2.7em; margin: 14px auto; max-width: 600px; padding: 0; background: #fff; color: #202124; border: none; box-shadow: none; }
.error { color: #a71919; }
.actions { display: flex; justify-content: center; gap: 16px; }
.comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.comparison figure { margin: 0; }
.comparison figcaption { font-weight: bold; margin: 10px 0; }
.comparison img { display: block; width: 100%; max-width: 360px; height: auto; margin: 0 auto; }
.scores { max-width: 640px; margin: 20px auto 30px; }
.axis { display: flex; justify-content: center; font-variant-numeric: tabular-nums; }
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
.help-options { display: flex; justify-content: space-between; gap: 24px; margin: 32px auto 0; }
.grid-trial .help-options button { width: 290px; max-width: 48%; padding: 16px; border: 1px solid #888; border-radius: 6px; background: white; color: #202124; line-height: 1.5; }
.test-cell { position: relative; display: flex; align-items: center; justify-content: center; }
@media (max-width: 560px) { .help-options { flex-direction: column; } .grid-trial .help-options button { max-width: 100%; width: 100%; } }
/* Less space above the grid. */
.maze-frame {
  margin: 10px auto 0;
}

/* Compact the space reserved for messages below the grid. */
.grid-trial .grid-message {
  min-height: 1.4em;
  margin: 6px auto;
  line-height: 1.4;
}

/* Keep Reset, Next and Check score close to the message. */
.grid-trial .actions {
  margin: 0;
  padding: 0;
}

/* Less space above the two help buttons. */
.grid-trial .help-options {
  margin: 6px auto 0;
}

/* Make the help buttons slightly shorter. */
.grid-trial .help-options button {
  padding: 8px 12px;
}



.maze-with-help {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 420px) minmax(0, 1fr);
  align-items: center;
  gap: 20px;
  margin: 12px auto 0;
}

/* Remove the grid's old top margin within this layout. */
.maze-with-help .maze-frame {
  width: 100%;
  margin: 0;
}

.help-side {
  display: flex;
  justify-content: center;
}

.grid-trial .help-button {
  width: 100%;
  max-width: 200px;
  padding: 14px;
  white-space: normal;
  line-height: 1.5;
  border: 1px solid #06e611;
  border-radius: 6px;
  background-color: #99e59d;
  color: rgb(7, 7, 7);
}

.grid-trial .help-button:hover:not(:disabled) {
  background-color: #14965d;
  border-color: #14965d;
}

/* On narrow screens, keep the grid readable
   and place the help buttons underneath. */
@media (max-width: 700px) {
  .maze-with-help {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .maze-with-help .maze-frame {
    grid-column: 1 / -1;
    grid-row: 1;
    max-width: 420px;
    justify-self: center;
  }

  .help-side {
    grid-row: 2;
  }
}
</style>