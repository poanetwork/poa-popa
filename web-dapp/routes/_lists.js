
const logger = require('../logger'); // eslint-disable-line no-unused-vars
const express = require('express');
const post_api = require('../server-lib/post_api');

const MIN_SEARCH_LEN = 2;

// eslint-disable-next-line no-unused-vars
module.exports = function (opts) {
    var router = express.Router();

    router.post('/lists/countries', function (req, res) {
        var name = req.body.input;

        if (!name || typeof name !== 'string') return res.json([]);
        name = name.toLowerCase();
        if (name.length < MIN_SEARCH_LEN) return res.json([]);
        var countries = post_api.lists.countries.filter((c) => {
            return (c.name.toLowerCase().indexOf(name) >= 0 || c.short_name.toLowerCase().indexOf(name) >= 0);
        });
        res.json(countries);
    });

    router.post('/lists/allCountries', function (req, res) {
        res.json(post_api.lists.countries);
    });

    router.post('/lists/states', function (req, res) {
        var cname = req.body.country;
        if (!cname || typeof cname !== 'string') return res.json([]);
        cname = cname.toLowerCase();
        if (cname !== 'united states') return res.json([]);

        var name = req.body.input;
        if (!name || typeof name !== 'string') return res.json([]);
        name = name.toLowerCase();
        if (name.length < MIN_SEARCH_LEN) return res.json([]);

        var states = post_api.lists.states.US.filter((s) => {
            return (s.name.toLowerCase().indexOf(name) >= 0 || s.short_name.toLowerCase().indexOf(name) >= 0);
        });

        res.json(states);
    });

    router.post('/lists/allStates', function (req, res) {
        var cname = req.body.country;
        if (!cname || typeof cname !== 'string') return res.json([]);
        cname = cname.toLowerCase();
        if (cname !== 'united states') return res.json([]);

        res.json(post_api.lists.states.US);
    });

    return router;
};
