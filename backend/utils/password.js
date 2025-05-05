import bcrypt from 'bcrypt';

/**
 * Hashes a plain-text password.
 * @param {string} password
 * @returns {Promise<string>} the bcrypt hash
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};
