<template>
  <div>
    <header class="test-meta">
      <h2>Score: {{ score }} / {{ totalQuestions }}</h2>
      <p v-if="!testOver && currWord" class="question-count">
        Question {{ currentIndex + 1 }} of {{ totalQuestions }}
      </p>
    </header>

    <form action="#" @submit.prevent="onSubmit" class="question-card">
      <div class="prompt">
        <div class="prompt-row">
          <span class="prompt-label"><i class="germany flag"></i> German</span>
          <span>{{ currWord ? currWord.german : '' }}</span>
        </div>
        <div class="prompt-row">
          <span class="prompt-label"><i class="vietnam flag"></i> Vietnamese</span>
          <span>{{ currWord ? currWord.vietnamese : '' }}</span>
        </div>
      </div>

      <fieldset class="options" :disabled="testOver">
        <legend>Choose the English translation</legend>
        <div
          v-for="option in options"
          :key="option.id"
          class="option"
        >
          <div class="ui radio checkbox">
            <input
              type="radio"
              :id="`option-${option.id}`"
              name="englishOption"
              :value="option.english"
              v-model="selectedOption"
              :disabled="testOver"
            >
            <label :for="`option-${option.id}`">{{ option.english }}</label>
          </div>
        </div>
      </fieldset>

      <button class="positive ui button" :disabled="testOver">Submit answer</button>
    </form>

    <p :class="['results', resultClass]" v-if="result">
      <span v-html="result"></span>
    </p>
  </div>
</template>

<script>
export default {
  name: 'vocab-test',
  props: {
    words: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      shuffledWords: [],
      currentIndex: 0,
      options: [],
      selectedOption: '',
      incorrectGuesses: [],
      result: '',
      resultClass: '',
      score: 0,
      testOver: false
    };
  },
  computed: {
    currWord() {
      return this.shuffledWords[this.currentIndex] || null;
    },
    totalQuestions() {
      return this.shuffledWords.length;
    }
  },
  watch: {
    words: {
      immediate: true,
      handler(newWords) {
        if (!Array.isArray(newWords) || !newWords.length) {
          this.shuffledWords = [];
          this.testOver = true;
          return;
        }
        this.resetTest();
      }
    }
  },
  methods: {
    resetTest() {
      this.shuffledWords = [...this.words].sort(() => 0.5 - Math.random());
      this.currentIndex = 0;
      this.score = 0;
      this.incorrectGuesses = [];
      this.result = '';
      this.resultClass = '';
      this.testOver = false;
      this.selectedOption = '';
      this.buildOptions();
    },
    buildOptions() {
      if (!this.currWord) {
        this.options = [];
        this.testOver = true;
        this.displayResults();
        return;
      }

      const distractors = [...this.words].filter(word => word._id !== this.currWord._id);
      distractors.sort(() => 0.5 - Math.random());
      const needed = Math.min(3, distractors.length);
      const picks = distractors.slice(0, needed);

      const choicePool = [...picks, this.currWord].map(word => ({
        id: word._id,
        english: word.english
      }));

      this.options = choicePool.sort(() => 0.5 - Math.random());
    },
    onSubmit() {
      if (this.testOver) return;
      if (!this.selectedOption) {
        this.flash('Please select an answer first', 'info', { timeout: 1200 });
        return;
      }

      if (this.selectedOption === this.currWord.english) {
        this.flash('Correct!', 'success', { timeout: 1000 });
        this.score += 1;
      } else {
        this.flash(`Wrong! Correct answer: ${this.currWord.english}`, 'error', { timeout: 1500 });
        this.incorrectGuesses.push(this.currWord.german);
      }

      this.selectedOption = '';
      this.currentIndex += 1;

      if (this.currentIndex >= this.totalQuestions) {
        this.testOver = true;
        this.displayResults();
        return;
      }

      this.buildOptions();
    },
    displayResults() {
      if (this.incorrectGuesses.length === 0) {
        this.result = 'You got everything correct. Well done!';
        this.resultClass = 'success';
        return;
      }

      const incorrect = this.incorrectGuesses.join(', ');
      this.result = `<strong>You got the following words wrong:</strong> ${incorrect}`;
      this.resultClass = 'error';
    }
  }
};
</script>

<style scoped>
.test-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
}

.question-count {
  color: #6b6b6b;
  font-weight: 500;
}

.question-card {
  margin-top: 1rem;
  padding: 1.25rem;
  border: 1px solid #dedede;
  border-radius: 6px;
  background: #fff;
}

.prompt {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.prompt-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.prompt-label {
  min-width: 140px;
  font-weight: 600;
}

.options {
  border: none;
  margin: 0 0 1rem;
  padding: 0;
}

.options legend {
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.option {
  margin-bottom: 0.5rem;
}

.results {
  margin: 25px auto;
  padding: 15px;
  border-radius: 5px;
}

.error {
  border: 1px solid #ebccd1;
  color: #a94442;
  background-color: #f2dede;
}

.success {
  border: 1px solid #d6e9c6;
  color: #3c763d;
  background-color: #dff0d8;
}

.ui.radio.checkbox input[type="radio"] {
  margin-right: 0.35rem;
}
</style>