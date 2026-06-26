const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('./db');
const nodemailer = require("nodemailer");

console.log("EMAIL:", process.env.EMAIL);
console.log("PASSWORD:", process.env.EMAIL_PASSWORD);

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const SECRET_KEY = "eshop_secret_key_2024";

// REGISTER
async function registerUser(req, reply) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return reply.status(400).send({ error: "Please enter all fields!" });
    }

    console.log("A - checking existing user");
    const existingUser = await db.execute({
      sql: `SELECT * FROM users WHERE email = ?`,
      args: [email],
    });
    if (existingUser.rows.length > 0) {
      return reply.status(400).send({ error: "Email already registered!" });
    }

    console.log("B - hashing password");
    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("C - OTP generated:", otp);

    const otpExpiry = Date.now() + 5 * 60 * 1000;

    console.log("D - deleting old pending_users row");
    await db.execute({
      sql: `DELETE FROM pending_users WHERE email = ?`,
      args: [email],
    });

    console.log("E - inserting new pending_users row");
    await db.execute({
      sql: `INSERT INTO pending_users (name, email, password, otp, otp_expiry) VALUES (?, ?, ?, ?, ?)`,
      args: [name, email, hashedPassword, otp, otpExpiry],
    });
    console.log("F - insert done");

    try {
      console.log("G - sending email");
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "OTP Verification",
        html: `<h2>Your OTP is ${otp}</h2><p>Valid for 5 minutes</p>`,
      });
      console.log("H - email sent successfully");
    } catch (emailError) {
      console.log("EMAIL ERROR:", emailError);
    }

    console.log("I - about to send reply");
    reply.send({ success: true, message: "OTP sent successfully" });
    console.log("J - reply.send called");
  } catch (err) {
    console.log("REGISTER FUNCTION CRASHED:", err);
    reply.status(500).send({ error: "Server error, please try again!" });
  }
}

// LOGIN
async function loginUser(req, reply) {
  const { email, password } = req.body;

  if (!email || !password) {
    return reply.status(400).send({ error: "Email aur password dono bharo!" });
  }

  // User dhundo database mein
  const res = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email]
  });

  const user = res.rows[0];

  // User nahi mila
  if (!user) {
    return reply.status(401).send({ error: "Email registered nahi hai!" });
  }

  // Password match karo
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return reply.status(401).send({ error: "Password galat hai!" });
  }

  // Token banao
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    SECRET_KEY,
    { expiresIn: "7d" }
  );

  reply.send({
    success: true,
    token,
    user: { name: user.name, email: user.email }
  });
}

async function resendOtp(req, reply) {
  const { email } = req.body;

  if (!email) {
    return reply.status(400).send({
      error: "Email required",
    });
  }

  // Pending user find karo
  const result = await db.execute({
    sql: `
      SELECT *
      FROM pending_users
      WHERE email = ?
    `,
    args: [email],
  });

  const user = result.rows[0];

  if (!user) {
    return reply.status(404).send({
      error: "User not found",
    });
  }

  // Naya OTP generate
  const newOtp = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // 60 sec validity
  const newExpiry =
   Date.now() + 5 * 60 * 1000;

  // Database update
  await db.execute({
    sql: `
      UPDATE pending_users
      SET otp = ?,
          otp_expiry = ?
      WHERE email = ?
    `,
    args: [
      newOtp,
      newExpiry,
      email,
    ],
  });

  // Email send
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,

    subject: "New OTP Verification",

    html: `
      <h2>Your new OTP is ${newOtp}</h2>
      <p>Valid for 60 seconds</p>
    `,
  });

  reply.send({
    success: true,
    message: "New OTP sent",
  });
}

async function verifyOtp(req, reply) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return reply.status(400).send({
      error: "Email and OTP required",
    });
  }

  const result = await db.execute({
    sql: `
      SELECT *
      FROM pending_users
      WHERE email = ?
    `,
    args: [email],
  });

  const user = result.rows[0];

  if (!user) {
    return reply.status(404).send({
      error: "User not found",
    });
  }

 if (String(user.otp).trim() !== String(otp).trim()) {
    return reply.status(400).send({
      error: "Invalid OTP",
    });
  }

if (Date.now() > Number(user.otp_expiry)) {
    return reply.status(400).send({
      error: "OTP expired",
    });
  }

  await db.execute({
    sql: `
      INSERT INTO users
      (
        name,
        email,
        password
      )
      VALUES (?, ?, ?)
    `,
    args: [
      user.name,
      user.email,
      user.password,
    ],
  });

  await db.execute({
    sql: `
      DELETE FROM pending_users
      WHERE email = ?
    `,
    args: [email],
  });

  reply.send({
    success: true,
    message: "OTP verified successfully",
  });
}

module.exports = { registerUser, loginUser, verifyOtp, resendOtp };