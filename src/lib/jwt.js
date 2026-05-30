// src/lib/jwt.js
import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      roles: user.roles || ["user"]
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}