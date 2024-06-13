"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SurveyOption {
  id: number;
  option_text: string;
  votes: number;
}

interface Survey {
  id: number;
  title: string;
  created_at: string;
  options: SurveyOption[];
}

interface ErrorResponse {
  error: string;
}

export default function AdminDashboardPage() {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [message, setMessage] = useState('');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchSurveys = async () => {
      const response = await fetch('/api/surveys');
      const data = await response.json();
      if (response.ok) {
        setSurveys(data);
      }
    };

    fetchSurveys();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, options }),
      });

      const data: Survey | ErrorResponse = await response.json();
      if (response.ok) {
        setMessage('Anket başarıyla oluşturuldu!');
        setTitle('');
        setOptions(['', '']);
        setSurveys([data as Survey, ...surveys]);
      } else {
        setMessage(`Hata: ${(data as ErrorResponse).error || 'Anket oluşturma başarısız.'}`);
      }
    } catch (error: any) {
      console.error("Anket oluşturma hatası:", error);
      setMessage(`Hata: ${error.message}`);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin Paneli</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700">Anket Başlığı:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 text-gray-800"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Seçenekler:</label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 text-gray-800"
                />
                <button type="button" onClick={() => handleRemoveOption(index)} className="ml-2 text-red-500">Sil</button>
              </div>
            ))}
            <button type="button" onClick={handleAddOption} className="mt-2 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200">Seçenek Ekle</button>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200">Anket Oluştur</button>
        </form>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
        <h2 className="text-2xl font-bold mt-8 text-center text-gray-800">Oluşturulan Anketler</h2>
        <ul>
          {surveys.map((survey) => (
            <li key={survey.id} className="mt-4 p-4 border rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-gray-800">{survey.title}</h3>
              {survey.options && survey.options.length > 0 && (
                <ul className="ml-4 list-disc">
                  {survey.options.map((option) => (
                    <li key={option.id} className="text-gray-700">{option.option_text}</li>
                  ))}
                </ul>
              )}
              <p className="text-gray-600 text-sm">Oluşturulma Tarihi: {new Date(survey.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
