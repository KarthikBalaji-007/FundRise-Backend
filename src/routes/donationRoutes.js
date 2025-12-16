const express = require('express');
const router = express.Router();

const {
  createDonation,
  getCampaignDonations,
  getMyDonations,
} = require('../controllers/donationController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public - get donations for a campaign
router.get('/campaign/:campaignId', getCampaignDonations);

// Private - create donation
router.post('/', authenticate, createDonation);

// Private - my donations
router.get('/my-donations', authenticate, getMyDonations);

module.exports = router;
