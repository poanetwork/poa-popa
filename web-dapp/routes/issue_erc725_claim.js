'use strict';

const express = require('express');
const {issueErc725Claim} = require('../controllers/issueErc725Claim');

module.exports = () => {
    const router = express.Router();
    router.post('/issueErc725Claim', issueErc725Claim);
    return router;
};
