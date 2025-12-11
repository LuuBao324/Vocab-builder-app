import axios from "axios";
import Vue from "vue";
import VueFlashMessage from 'vue-flash-message';
import 'vue-flash-message/dist/vue-flash-message.min.css';

Vue.use(VueFlashMessage, {
    messageOptions: {
        timeout: 3000,
        pauseOnInteract: true
    }
});

const vm = new Vue();
const baseURL = 'http://localhost:3000/words/';
const searchURL = 'http://localhost:3000/search';

const handleError = fn => (...params) =>
    fn(...params).catch(error => {
        vm.flash(`${error.response.status}: ${error.response.statusText}`, 'error');
    });

export const api = {
    getWord: handleError(async id => {
        const res = await axios.get(baseURL + id);
        return res.data;
    }),
    getWords: handleError(async sort => {
        const url = sort ? `${baseURL}?sort=${encodeURIComponent(sort)}` : baseURL;
        const res = await axios.get(url);
        return res.data;
    }),
    searchWords: handleError(async query => {
        const trimmed = query ? query.trim() : '';
        if (!trimmed) return [];
        const res = await axios.get(`${searchURL}?q=${encodeURIComponent(trimmed)}`);
        return res.data;
    }),
    deleteWord: handleError(async id => {
        const res = await axios.delete(baseURL + id);
        return res.data;
    }),
    createWord: handleError(async payload => {
        const res = await axios.post(baseURL, payload);
        return res.data;
    }),
    updateWord: handleError(async payload => {
        const res = await axios.put(baseURL + payload._id, payload);
        return res.data;
    })
}