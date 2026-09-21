const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://knowindiaback.vercel.app/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // For now, simply return the profile
      // JWT and database logic will be added later
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
        photo: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
      };
      return done(null, user);
    }
  )
);

module.exports = passport;

