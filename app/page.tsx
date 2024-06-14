"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

export default function HomePage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    const fetchSurveys = async () => {
      const response = await fetch('/api/surveys');
      const data = await response.json();
      if (response.ok) {
        setSurveys(data);
      }
    };

    fetchSurveys();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Anketler</h1>
        <ul>
          {surveys.map((survey) => (
            <li key={survey.id} className="mt-4 p-4 border rounded-lg shadow-sm">
              <Link href={`/surveys/${survey.id}`}>
                <span className="text-xl font-bold text-blue-500 hover:underline">{survey.title}</span>
              </Link>
              <p className="text-gray-600 text-sm">Oluşturulma Tarihi: {new Date(survey.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

