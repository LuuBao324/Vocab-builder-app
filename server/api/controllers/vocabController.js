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

const tokenize = text => {
    const normalized = normalize(text);
    if (!normalized) return [];
    return normalized.split(/\s+/).filter(Boolean);
};

const buildVector = tokens => {
    return tokens.reduce((vector, token) => {
        vector[token] = (vector[token] || 0) + 1;
        return vector;
    }, {});
};

const cosineSimilarity = (vecA, vecB) => {
    const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    if (!keys.size) return 0;
    let dot = 0;
    let magA = 0;
    let magB = 0;
    keys.forEach(key => {
        const a = vecA[key] || 0;
        const b = vecB[key] || 0;
        dot += a * b;
        magA += a * a;
        magB += b * b;
    });
    if (!magA || !magB) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

exports.list_all_words = (req, res) => {
    // support optional sort query param: ?sort=recent (default) or ?sort=old
    const sortParam = (req.query.sort || 'recent').toLowerCase();
    let sortObj = {};
    if (sortParam === 'old' || sortParam === 'old-to-new' || sortParam === 'old_to_new') {
        // ascending by updatedAt (oldest first)
        sortObj = { updatedAt: 1 };
    } else {
        // default: most recently updated first
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
        const queryVector = buildVector(normalizedQuery.split(/\s+/).filter(Boolean));
        const scored = words
            .map(word => {
                const combined = [word.english, word.german, word.vietnamese].join(' ');
                const normalizedCombined = normalize(combined);
                const wordVector = buildVector(normalizedCombined.split(/\s+/).filter(Boolean));
                const similarityScore = cosineSimilarity(queryVector, wordVector);
                const containsQuery = normalizedCombined.includes(normalizedQuery) ? 1 : 0;
                const score = Math.max(similarityScore, containsQuery);
                return { word, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.word);

        res.json(scored);
    });
};