// utils/sendToken.js

export const sendToken = (user, statusCode, message, res) => {
  // 1) Generate JWT
  const token = user.generateToken();

  // 2) Build cookie options
  const expireDays = Number(process.env.COOKIE_EXPIRE) || 7;
  const cookieOptions = {
    expires: new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only send over HTTPS in prod
    sameSite: 'none', // allow cross-site cookie
  };

  // 3) Sanitize user output
  const safeUser = {
    id:    user._id,
    name:  user.name,
    email: user.email,
    role:  user.role,
  };

  // 4) Send cookie + JSON
  return res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      user: safeUser,
      token,
    });
};
