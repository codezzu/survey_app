"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (response.ok) {
          localStorage.setItem('adminToken', data.token);
          setMessage("Giriş başarılı!");
          router.push('/admin/dashboard');
        } else {
          setMessage(`Hata: ${data.error || 'Giriş işlemi başarısız.'}`);
        }
      } catch (error: any) {
        console.error("Yanıt JSON formatında değil:", text);
        setMessage("Yanıt JSON formatında değil");
      }
    } catch (error: any) {
      console.error("Giriş hatası:", error);
      setMessage(`Hata: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin Giriş Yap</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700">Kullanıcı Adı:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 text-gray-800"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700">Şifre:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 text-gray-800"
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200">Giriş Yap</button>
        </form>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
}
