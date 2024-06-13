"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Kullanıcı adını yerel depolamadan al
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    // Çıkış yaparken token ve kullanıcı adını yerel depolamadan sil
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername('');
    router.push('/');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl">Anket Sitesi</Link>
        <div>
          {username ? (
            <div className="flex items-center">
              <span className="text-white mr-4">Hoşgeldin, {username}</span>
              <button onClick={handleLogout} className="text-white bg-red-500 py-2 px-4 rounded hover:bg-red-600 transition duration-200">Çıkış Yap</button>
            </div>
          ) : (
            <>
              <Link href="/register" className="text-white mr-4">
                Kayıt Ol
              </Link>
              <Link href="/login" className="text-white">
                Giriş Yap
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
