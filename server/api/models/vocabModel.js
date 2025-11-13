const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const vocabSchema = new Schema(
    {
        english: {
            type: String,
            required: 'English word is required'
        },
        german: {
            type: String,
            required: 'German word is required'
        }
    },
    {collection: 'vocab'}
);

module.exports = mongoose.model('Vocab', vocabSchema);