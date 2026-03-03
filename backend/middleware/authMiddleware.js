import { supabase } from '../config/supabase.js';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach Supabase user to request
    req.supabaseUser = user;

    // Get or create MongoDB user profile
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
