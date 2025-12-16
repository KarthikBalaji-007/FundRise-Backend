const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'simulated'],
      default: 'simulated',
    },
    paymentStatus: {
      type: String,
      enum: ['completed', 'failed'],
      default: 'completed',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    transactionId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donation', donationSchema);
