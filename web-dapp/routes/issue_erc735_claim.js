'use strict';

const express = require('express');
const {issueErc735Claim} = require('../controllers/issueErc735Claim');

module.exports = () => {
    const router = express.Router();
    router.post('/issueErc735Claim', issueErc735Claim);
    return router;
};
