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
          title: "Il gioco",
          text: `
            <p>
              Nel gioco vero e proprio, Leo assumerà sempre il ruolo di parlante e tu assumerai sempre il ruolo di ascoltatore.
              
              Tuttavia, <strong>il gioco ha una particolarità: dal punto di vista di Leo, una delle caselle è nascosta!</strong>
            </p>

            <p>
              <strong>Dal punto di vista di Leo, uno degli oggetti in ogni griglia è nascosto da un occlusore</strong>. Per questo motivo, <strong>Leo vede solo tre oggetti in ogni griglia</strong> e la quarta casella gli appare grigia.
              
              Questa casella grigia indica quindi la casella che Leo non vede.
            </p>

            <p>
              Ecco un esempio di ciò che vede Leo (a sinistra) e di ciò che vedi tu (a destra):
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/example_view.png"
                alt="Esempio delle prospettive del parlante e dell'ascoltatore"
                class="example-image"
              />
            </div>

            <p>
              Tuttavia, <strong>Leo non sa che una delle caselle gli è nascosta</strong>. Pensa che anche tu veda solo tre oggetti.
              
              A parte l'oggetto che Leo non può vedere, tu e Leo vedete gli stessi oggetti.
            </p>

          `
        },
        {
          title: "Il gioco",
          text: `
            <p>
              A partire dalla prossima schermata, <strong>Leo</strong> assumerà il ruolo di parlante e tu assumerai il ruolo di ascoltatore.
            </p>

            <p>
              Dovrai prima selezionare l'oggetto che pensi Leo stia descrivendo e successivamente <strong>rispondere a una domanda su cosa Leo vede, indicando la tua risposta su una barra graduata</strong>. Quando rispondi alla domanda, tieni in considerazione anche le tue risposte precendenti. 
            </p>

            <p>
              Una volta che hai selezionato l'oggetto e risposto alla domanda, clicca sul pulsante "Avanti" per passare alla griglia successiva.
            </p>

            <p>
              <strong>Alla fine del gioco dovrai rispondere a un breve questionario.</strong>
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