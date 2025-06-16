const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const upload = require('../middleware/uploadMiddleware'); // ✅ Cloudinary version
const User = require('../models/User');

router.use(cookieParser());

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Controllers
const {
  registerUser,
  loginUser,
  verifyEmail
} = require('../controllers/authController');

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Register / Login / Verify
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify/:token', verifyEmail);

// ✅ Upload CV to Cloudinary
router.post('/upload-cv', protect, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file || !req.file.path)
      return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user._id);
    user.cv = req.file.path; // Save Cloudinary file URL
    await user.save();

    res.json({ message: 'CV uploaded successfully', cvUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@'))
      return res.status(400).json({ message: 'Invalid email address' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({ message: 'If account exists, email will be sent' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 3600000;

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    user.passwordResetVerified = false;
    await user.save();

    const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;
    try {
      await sendEmail(user.email, 'Password Reset Request', `
        You requested a password reset. Click below:\n\n${resetUrl}
        If not, ignore this email.
      `);

      res.status(200).json({ message: 'Reset link sent', resetLink: resetUrl });
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      res.status(500).json({ message: 'Email failed', error: emailError.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Password reset error', error });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = true;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
});

// Profile Info
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manual VIP Activation
router.post('/vip/activate', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isVIP = true;
    await user.save();
    res.json({ message: 'VIP activated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
