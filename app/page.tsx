"use client";

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Link from 'next/link';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
  const [selectedSurvey, setSelectedSurvey] = useState<number | null>(null);

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

  const handleViewDetails = (id: number) => {
    setSelectedSurvey(selectedSurvey === id ? null : id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Anketler</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {surveys.map((survey) => (
            <div key={survey.id} className="p-4 border rounded-lg shadow-sm bg-white">
              <h3 className="text-xl font-bold text-gray-800">{survey.title}</h3>
              <p className="text-gray-600 text-sm">Oluşturulma Tarihi: {new Date(survey.created_at).toLocaleString()}</p>
              <ul className="ml-4 list-disc mt-2">
                {survey.options.map((option) => (
                  <li key={option.id} className="text-gray-700">{option.option_text}: {option.votes} oy</li>
                ))}
              </ul>
              <button 
                className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                onClick={() => handleViewDetails(survey.id)}
              >
                {selectedSurvey === survey.id ? 'Grafikleri Gizle' : 'Devamını Gör'}
              </button>
              {selectedSurvey === survey.id && (
                <div className="mt-4">
                  <Bar 
                    data={{
                      labels: survey.options.map(option => option.option_text),
                      datasets: [
                        {
                          label: 'Oylar',
                          data: survey.options.map(option => option.votes),
                          backgroundColor: 'rgba(75, 192, 192, 0.2)',
                          borderColor: 'rgba(75, 192, 192, 1)',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: true,
                          text: 'Anket Sonuçları',
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
