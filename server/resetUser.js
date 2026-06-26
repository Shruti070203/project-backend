require("dotenv").config();
const { db } = require("./db");

async function resetUser(email) {
  const u = await db.execute({ sql: "DELETE FROM users WHERE email = ?", args: [email] });
  const p = await db.execute({ sql: "DELETE FROM pending_users WHERE email = ?", args: [email] });
  console.log(`Deleted from users: ${u.rowsAffected}, from pending_users: ${p.rowsAffected}`);
}

const email = process.argv[2];
if (!email) {
  console.log("Usage: node resetUser.js email@example.com");
  process.exit(1);
}
resetUser(email).then(() => process.exit(0));