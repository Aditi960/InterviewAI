const { supabase } = require('../config/supabase');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.supabaseUser = user;

    let dbUser = await User.findOne({ supabaseId: user.id });
    if (!dbUser) {
      dbUser = await User.create({
        supabaseId: user.id,
        name: user.user_metadata?.full_name || user.email.split('@')[0],
        email: user.email,
        avatarUrl: user.user_metadata?.avatar_url || null,
      });
    }

    req.user = dbUser;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = authMiddleware;