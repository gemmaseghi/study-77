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
          title: "Il ruolo di ascoltatore",
          text: `
            <p>
              Passiamo ora al ruolo di ascoltatore!
              <strong>Il tuo compito nel ruolo di ascoltatore è cliccare sull'oggetto che, secondo te, Leo sta descrivendo</strong>.
            </p>

            <p>
              Questa volta <strong>non</strong> vedrai l'asterisco.
            </p>

            <p>
              Ecco un esempio di ciò che vedrai:
            </p>

            <div class="instruction-figure">
              <p class="image-caption">
                Il leone
              </p>

              <img
                src="instructions/instructions_listener.png"
                alt="Esempio della schermata dell'ascoltatore"
                class="example-image"
              />
            </div>
          `
        },

        {
          title: "Esercitazione nel ruolo di ascoltatore",
          text: `
            <p>
              Ora proverai il ruolo di ascoltatore! <strong>Clicca sull'oggetto che secondo te Leo sta descrivendo</strong>. Dopo ogni selezione, l'oggetto che hai selezionato verrà contrassegnato da un punto nero
            </p>

            <p>
              Poi spiega brevemente perché, secondo te, Leo ha scelto questa descrizione.
            </p>

            <p>
              Durante l'esercitazione selezionerai <strong>tre oggetti</strong>.
            </p>
          `
        }
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


.instructions :deep(.image-caption) {
  font-size: 22px;
  line-height: 1.3;
  font-weight: 600;
  text-align: center;
  margin: 0 0 12px 0;
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