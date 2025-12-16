const Campaign = require('../models/Campaign');

// @desc    Create new campaign
// @route   POST /api/campaigns
// @access  Private (Creator only)
exports.createCampaign = async (req, res) => {
  try {
    const { title, description, category, goalAmount, deadline, images, tags } = req.body;

    // Create campaign with creatorId from authenticated user
    const campaign = await Campaign.create({
      creatorId: req.user.userId,
      title,
      description,
      category,
      goalAmount,
      deadline,
      images: images || [],
      tags: tags || [],
      status: 'pending', // All campaigns start as pending (need admin approval)
    });

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully. Waiting for admin approval.',
      campaign,
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message,
    });
  }
};

// @desc    Get all campaigns (with filters, search, pagination)
// @route   GET /api/campaigns
// @access  Public
exports.getAllCampaigns = async (req, res) => {
  try {
    const { category, status, search, sort, page = 1, limit = 12 } = req.query;

    // Build query
    let query = {};

    // Only show active campaigns to public (admins can see all via different route)
    query.status = 'active';

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOption = {};
    if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'trending') {
      sortOption = { viewCount: -1, shareCount: -1 };
    } else if (sort === 'ending-soon') {
      sortOption = { deadline: 1 };
    } else {
      sortOption = { createdAt: -1 }; // default: newest first
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const campaigns = await Campaign.find(query)
      .populate('creatorId', 'name email avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Campaign.countDocuments(query);

    res.status(200).json({
      success: true,
      count: campaigns.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      campaigns,
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns',
      error: error.message,
    });
  }
};

// @desc    Get single campaign by slug
// @route   GET /api/campaigns/:slug
// @access  Public
exports.getCampaignBySlug = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ slug: req.params.slug })
      .populate('creatorId', 'name email avatar location');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    res.status(200).json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign',
      error: error.message,
    });
  }
};

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private (Creator - own campaigns only)
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Check if user is the creator of this campaign
    if (campaign.creatorId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this campaign',
      });
    }

    // Don't allow editing if campaign is completed
    if (campaign.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit completed campaigns',
      });
    }

    const { title, description, category, goalAmount, deadline, images, tags } = req.body;

    // Update fields
    if (title) campaign.title = title;
    if (description) campaign.description = description;
    if (category) campaign.category = category;
    if (goalAmount) campaign.goalAmount = goalAmount;
    if (deadline) campaign.deadline = deadline;
    if (images) campaign.images = images;
    if (tags) campaign.tags = tags;

    // If campaign was rejected and now being updated, set back to pending
    if (campaign.status === 'rejected') {
      campaign.status = 'pending';
    }

    await campaign.save();

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      campaign,
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign',
      error: error.message,
    });
  }
};

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private (Creator - own campaigns only)
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Check if user is the creator
    if (campaign.creatorId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this campaign',
      });
    }

    // Don't allow deletion if campaign has received donations
    if (campaign.currentAmount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete campaigns that have received donations',
      });
    }

    await campaign.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign',
      error: error.message,
    });
  }
};

// @desc    Get logged-in user's campaigns
// @route   GET /api/campaigns/my-campaigns
// @access  Private (Creator)
exports.getMyCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ creatorId: req.user.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (error) {
    console.error('Get my campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your campaigns',
      error: error.message,
    });
  }
};

// @desc    Increment view count
// @route   POST /api/campaigns/:id/view
// @access  Public
exports.incrementViewCount = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    res.status(200).json({
      success: true,
      viewCount: campaign.viewCount,
    });
  } catch (error) {
    console.error('Increment view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update view count',
      error: error.message,
    });
  }
};

// ============ ADMIN FUNCTIONS ============

// Get all pending campaigns (Admin only)
exports.getPendingCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'pending' })
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Pending campaigns fetched successfully',
      data: { campaigns, total: campaigns.length }
    });
  } catch (error) {
    console.error('Get pending campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending campaigns'
    });
  }
};

// Approve campaign (Admin only)
exports.approveCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is already approved'
      });
    }

    campaign.status = 'active';
    campaign.isVerified = true;
    await campaign.save();

    res.status(200).json({
      success: true,
      message: 'Campaign approved successfully',
      data: { campaign }
    });
  } catch (error) {
    console.error('Approve campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve campaign'
    });
  }
};

// Reject campaign (Admin only)
exports.rejectCampaign = async (req, res) => {
  try {
    const { reason } = req.body;
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    campaign.status = 'rejected';
    campaign.rejectionReason = reason || 'Campaign did not meet platform guidelines';
    await campaign.save();

    res.status(200).json({
      success: true,
      message: 'Campaign rejected successfully',
      data: { campaign }
    });
  } catch (error) {
    console.error('Reject campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject campaign'
    });
  }
};