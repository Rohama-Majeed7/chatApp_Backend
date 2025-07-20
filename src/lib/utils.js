import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn:"7d", // Token expiration time
  });

  res.cookie("jwt", token, {
  httpOnly: true,
  secure: true, // ✅ for HTTPS
  sameSite: "None", // ✅ because frontend and backend are on different domains
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

  return token;
};
