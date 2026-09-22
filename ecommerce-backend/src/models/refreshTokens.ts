import { pool } from "../config/db";
export const insertRefreshToken = async (
  userId: number,
  tokenHash: string,
  expiresAt: Date,
) => {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );
};

export async function findRefreshToken(tokenHash: string) {
  const result = await pool.query(
    `SELECT * FROM refresh_tokens WHERE token_hash = $1`,
    [tokenHash],
  );
  return result.rows[0];
}
export async function deleteRefreshToken(tokenHash: string) {
  await pool.query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [
    tokenHash,
  ]);
}
