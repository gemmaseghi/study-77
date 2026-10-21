<template>
  <section class="rule-summary">
    <h2>Game rules: summary</h2>
    <ul>
      <li>Start at the green cell and finish at the yellow cell.</li>
      <li>No diagonal moves are allowed</li>
      <li>You cannot visit a cell more than once.</li>
      <li>Each cell beyond the shortest path costs 1 point.</li>
      <li>Each orange cell you visit makes you gain 2 points.</li>
    </ul>
  </section>
</template>

<script>
export default { name: "RuleSummary" };
</script>

<style scoped>
.rule-summary { max-width: 700px; margin: 20px auto; }
.rule-summary h2 { text-align: center; }
.rule-summary ul { text-align: left; padding-left: 28px; }
.rule-summary li { font-size: 18px; line-height: 1.6; margin-bottom: 14px; }
</style>
