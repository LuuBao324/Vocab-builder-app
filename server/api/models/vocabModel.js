const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const vocabSchema = new Schema(
    {
        english: {
            type: String,
            required: [true, 'English word is required'],
            trim: true,
            minlength: [1, 'English word cannot be empty']
        },
        german: {
            type: String,
            required: [true, 'German word is required'],
            trim: true,
            minlength: [1, 'German word cannot be empty']
        },
        vietnamese: {
            type: String,
            required: [true, 'Vietnamese word is required'],
            trim: true,
            minlength: [1, 'Vietnamese word cannot be empty']
        }
    },
    {
        collection: 'vocab3',
        timestamps: true
    }
);

module.exports = mongoose.model('Vocab', vocabSchema);