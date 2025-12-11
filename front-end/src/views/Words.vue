<template>
    <div>
        <h1>Words</h1>
        <div class="ui form" style="margin-bottom:1rem;">
            <div class="fields" style="flex-wrap:wrap; gap:0.75rem;">
                <div class="field" style="min-width:180px; display:flex; flex-direction:column; gap:0.35rem;">
                    <select
                        id="sortSelect"
                        v-model="sortOrder"
                        @change="fetchWords"
                        class="ui dropdown"
                        :disabled="isSearching"
                    >
                        <option value="recent">Recently updated</option>
                        <option value="old">Old to new</option>
                    </select>
                </div>
                <div class="field" style="flex:1; min-width:260px; display:flex; flex-direction:column; gap:0.35rem;">
                    <div class="ui action input" style="width:100%;">
                        <input
                            id="searchInput"
                            type="text"
                            placeholder="English, German or Vietnamese"
                            v-model.trim="searchTerm"
                            @input="handleSearchInput"
                            @keyup.enter.prevent="runImmediateSearch"
                        >
                        <button
                            class="ui button"
                            type="button"
                            @click="clearSearch"
                            :disabled="!searchTerm"
                        >Clear</button>
                    </div>
                </div>
            </div>
        </div>
        <table id="words" class="ui celled compact table">
            <thead>
                <tr>
                    <th>English</th>
                    <th>German</th>
                    <th>Vietnamese</th>
                    <th colspan="3"></th>
                </tr>
            </thead>
            <tr v-for="(word, i) in words" :key="i">
                <td>{{ word.english }}</td>
                <td>{{ word.german }}</td>
                <td>{{ word.vietnamese }}</td>
                <td width="75" class="center aligned">
                    <router-link :to="{ name: 'show', params: { id: word._id}}">Show</router-link>
                </td>
                <td width="75" class="center aligned">
                    <router-link :to="{ name: 'edit', params: { id: word._id}}">Edit</router-link>
                </td>
                <td width="75" class="center aligned" @click.prevent="onDestroy(word._id)">
                    <a :href="`/words/${word._id}`">Destroy</a>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
import { api } from '../helpers/helpers';

export default {
    name: 'words',
    data() {
        return {
            words: [],
            sortOrder: 'recent',
            searchTerm: '',
            isSearching: false,
            searchTimeout: null
        }
    },
    methods: {
        async fetchWords() {
            this.words = await api.getWords(this.sortOrder);
            this.isSearching = false;
        },
        handleSearchInput() {
            this.clearSearchTimeout();
            this.searchTimeout = setTimeout(() => {
                this.performSearch(this.searchTerm);
            }, 350);
        },
        async runImmediateSearch() {
            this.clearSearchTimeout();
            await this.performSearch(this.searchTerm);
        },
        async performSearch(value) {
            const query = (value || '').trim();
            if (!query) {
                await this.fetchWords();
                return;
            }
            this.isSearching = true;
            this.words = await api.searchWords(query);
        },
        async clearSearch() {
            if (!this.searchTerm) return;
            this.searchTerm = '';
            this.isSearching = false;
            this.clearSearchTimeout();
            await this.fetchWords();
        },
        clearSearchTimeout() {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = null;
            }
        },
        async onDestroy(id) {
            const sure = window.confirm('Are you sure you want to delete this word?');
            if (!sure) return
            await api.deleteWord(id);
            this.flash('Word deleted successfully', 'success');
            const newWords = this.words.filter(word => word._id !== id)
            this.words = newWords;
            
        }
    },
    async mounted() {
        await this.fetchWords();
    },
    beforeDestroy() {
        this.clearSearchTimeout();
    }
};
</script>