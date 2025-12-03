import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  // ------------------------------
  // 1. Extract tokens
  // ------------------------------
  const refreshToken =
    req.cookies?.refreshToken ||
    (req.headers?.refreshtoken?.startsWith("Bearer ")
      ? req.headers.refreshtoken.split(" ")[1]
      : null);

  const accessToken =
    req.cookies?.accessToken ||
    (req.headers?.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  // ------------------------------
  // 2. If access token exists → verify normally
  // ------------------------------
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      console.log("⚠️ Access token expired or invalid");
    }
  }

  // ------------------------------
  // 3. Access token missing or expired → check refresh token
  // ------------------------------
  if (!refreshToken) {
    console.log("❌ No tokens provided at all");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("Refresh token valid, issuing new access token" , process.env.REFRESH_TOKEN_SECRET);
    const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log("Decoded Refresh Token:", decodedRefresh);
    // ------------------------------
    // 4. Create a new access token
    // ------------------------------
    const newAccessToken = jwt.sign(
      { id: decodedRefresh.id, email: decodedRefresh.email, role: decodedRefresh.role },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    console.log("🔄 New access token issued");

    // Send new access token as cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60 * 1000,
    });

    req.user = decodedRefresh; // user info from refresh token
    return next();
  } catch (err) {
    console.log("⛔ Invalid refresh token:", err.message);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};
