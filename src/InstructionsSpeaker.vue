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
          title: "Benvenuto!",
          text: `
            <p>
              In questo esperimento parteciperai a un gioco di comunicazione con un partecipante virtuale di nome <strong>Leo</strong>.
            </p>

            <p>
              Il gioco prevede due ruoli: <strong>il ruolo di parlante</strong> e <strong>il ruolo di ascoltatore</strong>.
            </p>

            <p>
              Durante il gioco <strong>Leo assumerà sempre il ruolo di parlante</strong> e <strong>tu assumerai sempre il ruolo di ascoltatore</strong>.
            </p>

            <p>
              <strong>Prima di iniziare il gioco, però, proverai brevemente entrambi i ruoli</strong>, per capire come funziona.
            </p>

          `
        },

        {
          title: "Il ruolo di parlante",
          text: `
            <p>
              Cominciamo dal ruolo di parlante.

              <strong>Il tuo compito nel ruolo di parlante è descrivere l'oggetto contrassegnato da un asterisco (*) in modo che Leo possa identificarlo</strong>.

              Leo <strong>non</strong> vede l'asterisco.
            </p>

            <p>
              Nelle tue descrizioni puoi nominare l'oggetto indicato dall'asterisco, ma <strong>non puoi usare indicazioni sulla sua posizione</strong>, come ad esempio "in alto a sinistra" o "in basso a destra".
            </p>

            <p>
              Ecco un esempio di ciò che vedrai:
            </p>

            <div class="instruction-figure">
              <img
                src="instructions/instructions_speaker.png"
                alt="Esempio della schermata del parlante"
                class="example-image"
              />

              <p>
                In questo caso, una possibile descrizione sarebbe: <strong>La maglietta</strong>.
              </p>
            </div>
          `
        },

        {
          title: "Esercitazione nel ruolo di parlante",
          text: `
            <p>
              Ora proverai il ruolo di parlante!
            </p>

            <p>
              Per ogni griglia, scrivi <strong>una descrizione dell'oggetto contrassegnato dall'asterisco (*)</strong>. Leo userà la tua descrizione per identificare l'oggetto.
            </p>

            <p>
              Poi spiega brevemente perché hai scelto questa descrizione.
            </p>

            <p>
              Durante l'esercitazione descriverai <strong>tre oggetti</strong>.
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