const Razorpay = require('razorpay');
const crypto = require('crypto');

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

let razorpay = null;
if (KEY_ID && KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: KEY_ID,
      key_secret: KEY_SECRET,
    });
    console.log('[PAYMENTS] Razorpay SDK initialized successfully.');
  } catch (err) {
    console.error('[PAYMENTS] Failed to initialize Razorpay:', err.message);
  }
} else {
  console.log('[PAYMENTS] Razorpay keys not detected in .env. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
}

/**
 * Create a new Razorpay order
 * @param {Object} params
 * @param {number} params.amountInRupees - Price in INR
 * @param {string} params.receipt - Unique internal receipt string
 * @param {Object} [params.notes={}] - Metadata notes
 * @returns {Promise<Object>}
 */
async function createRazorpayOrder({ amountInRupees, receipt, notes = {} }) {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env');
  }

  const amountInPaise = Math.round(Number(amountInRupees) * 100);
  if (isNaN(amountInPaise) || amountInPaise <= 0) {
    throw new Error('Invalid order amount');
  }

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt.slice(0, 40),
    notes,
  };

  return await razorpay.orders.create(options);
}

/**
 * Verify Razorpay payment signature
 * @param {Object} params
 * @param {string} params.orderId
 * @param {string} params.paymentId
 * @param {string} params.signature
 * @returns {boolean}
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured');
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Verify Razorpay webhook signature
 * @param {string|Buffer} rawBody
 * @param {string} signature
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, signature) {
  if (!WEBHOOK_SECRET) {
    console.warn('[PAYMENTS] RAZORPAY_WEBHOOK_SECRET not configured.');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Process a refund through Razorpay
 * @param {string} paymentId
 * @param {number} [amountInRupees]
 * @returns {Promise<Object>}
 */
async function refundPayment(paymentId, amountInRupees = null) {
  if (!razorpay) {
    throw new Error('Razorpay is not configured for refunds.');
  }

  const options = {};
  if (amountInRupees) {
    options.amount = Math.round(Number(amountInRupees) * 100);
  }

  return await razorpay.payments.refund(paymentId, options);
}

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  refundPayment,
  isRazorpayConfigured: () => !!razorpay,
  getKeyId: () => KEY_ID || '',
};
