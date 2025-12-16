const mongoose = require('mongoose');
const slugify = require('slugify');

const campaignSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Campaign description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['medical', 'education', 'emergency', 'creative', 'charity'],
    },
    goalAmount: {
      type: Number,
      required: [true, 'Goal amount is required'],
      min: [1000, 'Goal amount must be at least 1000'],
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    images: [String], // Array of image URLs
    videoUrl: String,
    deadline: {
      type: Date,
      required: [true, 'Campaign deadline is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'active', 'completed', 'failed', 'rejected'],
      default: 'pending',
    },
    // Verification fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: [String], // URLs to uploaded docs
    adminNotes: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    // Analytics
    viewCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    donorCount: {
      type: Number,
      default: 0,
    },
    // Withdrawal
    withdrawalRequested: {
      type: Boolean,
      default: false,
    },
    withdrawalAmount: Number,
    tags: [String],
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Auto-generate slug from title before saving
campaignSchema.pre('save', async function () {
  if (this.isModified('title') && this.title) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Check for existing slugs and append counter if needed
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
});

// Virtual field: days left
campaignSchema.virtual('daysLeft').get(function () {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Virtual field: funding percentage
campaignSchema.virtual('fundingPercentage').get(function () {
  if (!this.goalAmount || this.goalAmount === 0) {
    return 0;
  }
  return Math.round((this.currentAmount / this.goalAmount) * 100);
});

// Include virtuals in JSON
campaignSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Campaign', campaignSchema);
