import db from "../models/index.js";
import CryptoJS from "crypto-js";
import { config } from "../config/auth.config.js";

const User = db.userProfile;

console.log("MODEL:", User);

export const changePassword = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { userId, currentPassword, newPassword } = req.body;

    console.log("USER ID:", userId);

    const user = await User.findOne({
      where: {
        userID: userId,
      },
    });

    console.log("FOUND USER:", user);

    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    const bytes = CryptoJS.AES.decrypt(
      user.password,
      config.secret
    );

    const decryptedPassword = JSON.parse(
      bytes.toString(CryptoJS.enc.Utf8)
    );

    console.log("DECRYPTED:", decryptedPassword);

    if (decryptedPassword !== currentPassword) {
      return res.status(400).send({
        message: "Current password is incorrect",
      });
    }

    const encryptedPassword = CryptoJS.AES.encrypt(
      JSON.stringify(newPassword),
      config.secret
    ).toString();

    await User.update(
      {
        password: encryptedPassword,
      },
      {
        where: {
          userID: userId,
        },
      }
    );

    return res.status(200).send({
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("FULL ERROR:", error);

    return res.status(500).send({
      message: error.message,
      error: error,
    });
  }
};