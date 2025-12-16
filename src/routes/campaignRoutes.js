const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { isCreator } = require('../middlewares/roleCheck');
const { adminOnly } = require('../middlewares/adminCheck');
const {
  createCampaign,
  getAllCampaigns,
  getCampaignBySlug,
  updateCampaign,
  deleteCampaign,
  getMyCampaigns,
  incrementViewCount,
  getPendingCampaigns,
  approveCampaign,
  rejectCampaign
} = require('../controllers/campaignController');

// Public routes
router.get('/', getAllCampaigns);
router.post('/:id/view', incrementViewCount);

// PROTECTED ROUTES - MUST BE BEFORE /:slug
router.get('/my-campaigns', authenticate, getMyCampaigns); // THIS FIRST!
router.post('/', authenticate, isCreator, createCampaign);
router.put('/:id', authenticate, isCreator, updateCampaign);
router.delete('/:id', authenticate, isCreator, deleteCampaign);

// ADMIN ROUTES - BEFORE /:slug
router.get('/admin/pending', authenticate, adminOnly, getPendingCampaigns);
router.put('/:id/approve', authenticate, adminOnly, approveCampaign);
router.put('/:id/reject', authenticate, adminOnly, rejectCampaign);

// GET BY SLUG - MUST BE LAST!
router.get('/:slug', getCampaignBySlug);

module.exports = router;
