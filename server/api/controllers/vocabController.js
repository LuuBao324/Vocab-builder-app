const mongoose = require('mongoose');
const Vocab = mongoose.model('Vocab');

const normalize = text => {
    if (!text) return '';
    return text
        .toString()
        .normalize('NFD')
        .replace(/[^\p{L}\s]/gu, ' ')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
};

exports.list_all_words = (req, res) => {
    const sortParam = (req.query.sort || 'recent').toLowerCase();
    let sortObj = {};
    if (sortParam === 'old') {
        sortObj = { updatedAt: 1 };
    } else {
        sortObj = { updatedAt: -1 };
    }

    Vocab.find({}).sort(sortObj).exec((err, words) => {
        if (err) return res.status(500).send(err);
        res.json(words);
    });
};

exports.create_a_word = (req, res) => {
    const new_word = new Vocab(req.body);
    new_word.save((err, word) => {
        if (err) res.send(err);
        res.json(word);
    });
};

exports.read_a_word = (req, res) => {
    Vocab.findById(req.params.wordId, (err, word) => {
        if (err) res.send(err);
        res.json(word);
    });
};

exports.update_a_word = (req, res) => {
    Vocab.findOneAndUpdate(
        { _id: req.params.wordId },
        req.body,
        { new: true },
        (err, word) => {
            if (err) res.send(err);
            res.json(word);
        }
    );
};

exports.delete_a_word = (req, res) => {
    Vocab.deleteOne({ _id: req.params.wordId }, (err) => {
        if (err) res.send(err);
        res.json({
            message: 'Word successfully deleted',
            _id: req.params.wordId
        });
    });
};

exports.search_words = (req, res) => {
    const query = (req.query.q || '').trim();
    if (!query) {
        return res.status(400).send({ message: 'Query parameter "q" is required' });
    }

    Vocab.find({}, (err, words) => {
        if (err) return res.status(500).send(err);
        const normalizedQuery = normalize(query);

        const matches = words.filter(word => {
            const combined = [word.english, word.german, word.vietnamese].join(' ');
            const normalizedCombined = normalize(combined);
            return normalizedCombined.includes(normalizedQuery);
        });

        res.json(matches);
    });
};