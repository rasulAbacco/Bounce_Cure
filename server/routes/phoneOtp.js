const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const redis = require('redis');
const rateLimit = require('express-rate-limit');

// your routes here
 

// Initialize services
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// Redis client setup
let redisClient;
if (process.env.REDIS_URL) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });
} else {
  redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 5000
  });
}

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

// Connect to Redis
redisClient.connect().catch(console.error);

// Rate limiting for OTP requests
const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 OTP requests per windowMs
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validatePhoneNumber = (req, res, next) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  // Basic phone number validation (adjust regex as needed)
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  const cleanNumber = phoneNumber.replace(/[\s-().]/g, '');
  
  if (!phoneRegex.test(cleanNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Indian mobile number format'
    });
  }

  req.cleanPhoneNumber = cleanNumber.startsWith('+91') ? cleanNumber : `+91${cleanNumber}`;
  next();
};

export const validateOTP = (req, res, next) => {
  const { otp, phoneNumber } = req.body;
  
  if (!otp || !phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'OTP and phone number are required'
    });
  }

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: 'OTP must be 6 digits'
    });
  }

  next();
};

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in Redis
const storeOTP = async (phoneNumber, otp, expiryMinutes = 5) => {
  const key = `otp:${phoneNumber}`;
  await redisClient.setEx(key, expiryMinutes * 60, otp);
  
  // Also store attempt count
  const attemptKey = `otp_attempts:${phoneNumber}`;
  await redisClient.setEx(attemptKey, expiryMinutes * 60, '0');
};

// Get OTP from Redis
const getOTP = async (phoneNumber) => {
  const key = `otp:${phoneNumber}`;
  return await redisClient.get(key);
};

// Get attempt count
const getAttemptCount = async (phoneNumber) => {
  const attemptKey = `otp_attempts:${phoneNumber}`;
  const count = await redisClient.get(attemptKey);
  return parseInt(count) || 0;
};

// Increment attempt count
const incrementAttempts = async (phoneNumber) => {
  const attemptKey = `otp_attempts:${phoneNumber}`;
  await redisClient.incr(attemptKey);
};

// Delete OTP after successful verification
const deleteOTP = async (phoneNumber) => {
  const otpKey = `otp:${phoneNumber}`;
  const attemptKey = `otp_attempts:${phoneNumber}`;
  await Promise.all([
    redisClient.del(otpKey),
    redisClient.del(attemptKey)
  ]);
};

// Routes

// Send OTP
router.post('/send-otp', otpRateLimit, validatePhoneNumber, async (req, res) => {
  const cleanPhoneNumber = req.cleanPhoneNumber;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    const message = await twilioClient.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: cleanPhoneNumber
    });

    await redisClient.setEx(`otp:${cleanPhoneNumber}`, 300, otp);
    await redisClient.setEx(`otp_attempts:${cleanPhoneNumber}`, 300, '0');

    res.json({ success: true, message: 'OTP sent successfully', data: { phoneNumber: cleanPhoneNumber, messageSid: message.sid } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
});


// Verify OTP
router.post('/verify-otp', validateOTP, async (req, res) => {
  const { otp, phoneNumber } = req.body;
  const cleanPhoneNumber = phoneNumber.replace(/[\s-().]/g, '');
  const formattedNumber = cleanPhoneNumber.startsWith('+91') ? cleanPhoneNumber : `+91${cleanPhoneNumber}`;

  try {
    // Check attempt count
    const attemptCount = await getAttemptCount(formattedNumber);
    if (attemptCount >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
      });
    }

    // Get stored OTP
    const storedOTP = await getOTP(formattedNumber);
    
    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found. Please request a new OTP.'
      });
    }

    if (storedOTP === otp) {
      // Successful verification
      await deleteOTP(formattedNumber);
      
      console.log(`✅ OTP verified successfully for ${formattedNumber}`);
      
      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          phoneNumber: formattedNumber,
          verifiedAt: new Date().toISOString()
        }
      });
    } else {
      // Invalid OTP
      await incrementAttempts(formattedNumber);
      const newAttemptCount = await getAttemptCount(formattedNumber);
      
      res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        data: {
          attemptsRemaining: 3 - newAttemptCount
        }
      });
    }

  } catch (error) {
    console.error('OTP verification failed:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check OTP status
router.post('/otp-status', (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  const cleanPhoneNumber = phoneNumber.replace(/[\s-().]/g, '');
  const formattedNumber = cleanPhoneNumber.startsWith('+91') ? cleanPhoneNumber : `+91${cleanPhoneNumber}`;

  getOTP(formattedNumber).then(storedOTP => {
    res.json({
      success: true,
      data: {
        otpExists: !!storedOTP,
        phoneNumber: formattedNumber
      }
    });
  }).catch(error => {
    res.status(500).json({
      success: false,
      message: 'Failed to check OTP status'
    });
  });
});

// Resend OTP (with cooldown)
router.post('/resend-otp', otpRateLimit, validatePhoneNumber, async (req, res) => {
  const cleanPhoneNumber = req.cleanPhoneNumber;
  
  try {
    // Check if there's already an active OTP
    const existingOTP = await getOTP(cleanPhoneNumber);
    if (existingOTP) {
      // Delete existing OTP before sending new one
      await deleteOTP(cleanPhoneNumber);
    }

    const otp = generateOTP();
    
    // Send SMS via Twilio
    const message = await twilioClient.messages.create({
      body: `Your Phone Verification OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: cleanPhoneNumber
    });

    // Store new OTP
    await storeOTP(cleanPhoneNumber, otp, 5);

    console.log(`🔄 OTP resent to ${cleanPhoneNumber}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        phoneNumber: cleanPhoneNumber,
        expiryTime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Failed to resend OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
});

module.exports = router;