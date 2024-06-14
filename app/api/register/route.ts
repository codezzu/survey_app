import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );
    const token = jwt.sign({ id: newUser.rows[0].id }, SECRET_KEY, {
      expiresIn: '1h',
    });
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
