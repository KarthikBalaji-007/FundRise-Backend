const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

// @desc    Create donation (simulated payment)
// @route   POST /api/donations
// @access  Private (authenticated users - donors)
exports.createDonation = async (req, res) => {
  try {
    const { campaignId, amount, message, isAnonymous, paymentMethod } = req.body;

    // Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Donation amount must be at least ₹1',
      });
    }

    // Check if campaign exists and is active
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This campaign is not accepting donations',
      });
    }

    // Generate simulated transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create donation
    const donation = await Donation.create({
      campaignId,
      donorId: req.user.userId,
      amount,
      message: message || '',
      isAnonymous: isAnonymous || false,
      paymentMethod: paymentMethod || 'simulated',
      paymentStatus: 'completed',
      transactionId,
    });

    // Update campaign totals
    campaign.currentAmount += amount;
    campaign.donorCount += 1;
    await campaign.save();

    // Populate donor info for response
    await donation.populate('donorId', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Donation successful. Thank you!',
      data: { donation },
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process donation',
      error: error.message,
    });
  }
};

// @desc    Get donations for a campaign
// @route   GET /api/donations/campaign/:campaignId
// @access  Public
exports.getCampaignDonations = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { limit = 10 } = req.query;

    const donations = await Donation.find({ campaignId })
      .populate('donorId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: donations.length,
      data: { donations },
    });
  } catch (error) {
    console.error('Get campaign donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
    });
  }
};

// @desc    Get user's donation history
// @route   GET /api/donations/my-donations
// @access  Private (authenticated user)
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.userId })
      .populate('campaignId', 'title slug images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: { donations },
    });
  } catch (error) {
    console.error('Get my donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your donations',
    });
  }
};