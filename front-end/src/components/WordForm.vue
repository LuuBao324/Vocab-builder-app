<template>
    <form action="#" @submit.prevent="onSubmit">
      <p v-if="errorsPresent" class="error">{{ errorMessage }}</p>
      
       <div class="ui labeled input fluid">
         <div class="ui label">
           <i class="united kingdom flag"></i> English
         </div>
         <input type="text" placeholder="Enter word..." v-model="word.english" />
       </div>

       <div class="suggest-actions">
         <button
          type="button"
          class="ui button"
          :class="{ loading: suggestLoading }"
          :disabled="suggestLoading"
          @click="suggestTranslations"
         >
           {{ suggestLoading ? 'Fetching...' : 'Suggest translations' }}
         </button>
       </div>

     <div class="ui labeled input fluid">
       <div class="ui label">
         <i class="germany flag"></i> German
       </div>
       <input type="text" placeholder="Enter word..." v-model="word.german" />
     </div>
 
     <div class="ui labeled input fluid">
        <div class="ui label">
          <i class="vietnam flag"></i> Vietnamese
        </div>
        <input type="text" placeholder="Enter word..." v-model="word.vietnamese" />
     </div>
 
     <button class="positive ui button">Submit</button>
   </form>
 </template>
 
 <script>
 export default {
   name: 'word-form',
   props: {
     word: {
       type: Object,
       required: false,
       default: () => {
            return {
                english: '',
                german: '',
                vietnamese: ''
            };
       }
     }
   },
   data() {
     return {
       errorsPresent: false,
       errorMessage: '',
       suggestLoading: false
     };
   },
   methods: {
     onSubmit: function() {
       // Trim inputs before validation so fields containing only spaces are treated as empty
       const english = (this.word.english || '').toString().trim();
       const german = (this.word.german || '').toString().trim();
       const vietnamese = (this.word.vietnamese || '').toString().trim();

       if (english.length === 0 || german.length === 0 || vietnamese.length === 0) {
            this.errorMessage = 'Please fill out all fields';
            this.errorsPresent = true;
            return;
       }

       this.errorsPresent = false;
       this.errorMessage = '';

       const payload = { ...this.word, english, german, vietnamese };
       this.$emit('createOrUpdate', payload);
     },
     // Suggest German and Vietnamese translations via the MyMemory API
     suggestTranslations: async function() {
       const english = (this.word.english || '').toString().trim();
       if (!english) {
         this.errorMessage = 'Enter an English word before requesting suggestions';
         this.errorsPresent = true;
         return;
       }

       this.errorsPresent = false;
       this.errorMessage = '';
       this.suggestLoading = true;

       try {
         const [german, vietnamese] = await Promise.all([
           this.fetchTranslation(english, 'de'),
           this.fetchTranslation(english, 'vi')
         ]);

         if (german) this.$set(this.word, 'german', german);
         if (vietnamese) this.$set(this.word, 'vietnamese', vietnamese);
       } catch (error) {
         this.errorMessage = 'Unable to fetch suggested translations. Please try again.';
         this.errorsPresent = true;
       } finally {
         this.suggestLoading = false;
       }
     },
     fetchTranslation: async function(text, targetLang) {
       const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
       const response = await fetch(url);
       if (!response.ok) {
         throw new Error('Translation API request failed');
       }

       const payload = await response.json();
       const suggestion = (payload && payload.responseData && payload.responseData.translatedText) || '';
       return suggestion.trim();
     }
   }
 };
 </script>
 
 <style scoped>
 .error {
   color: red;
 }

.ui.labeled.input .ui.label {
  white-space: nowrap;
  min-width: 140px;
}

.suggest-actions {
  margin: 0.5rem 0 1rem;
  text-align: right;
}
 </style>