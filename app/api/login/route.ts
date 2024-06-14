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
    const user = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (user.rows.length === 0) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 400 });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return NextResponse.json({ error: 'Geçersiz şifre' }, { status: 400 });
    }

    const token = jwt.sign({ id: user.rows[0].id }, SECRET_KEY, {
      expiresIn: '1h',
    });
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("Giriş hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
