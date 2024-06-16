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
  const [selectedOption, setSelectedOption] = useState<{ [key: number]: number | null }>({});
  const [message, setMessage] = useState('');

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

  const handleVote = async (surveyId: number) => {
    const optionId = selectedOption[surveyId];
    if (!optionId) {
      setMessage('Lütfen bir seçenek seçin');
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionId }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Oy başarıyla kullanıldı!');
        setSurveys((prevSurveys) => 
          prevSurveys.map((survey) =>
            survey.id === surveyId
              ? { ...survey, options: survey.options.map((option) => 
                  option.id === optionId 
                    ? { ...option, votes: option.votes + 1 } 
                    : option
                )}
              : survey
          )
        );
      } else {
        setMessage(`Hata: ${data.error || 'Oy kullanma başarısız.'}`);
      }
    } catch (error: any) {
      console.error("Oy kullanma hatası:", error);
      setMessage(`Hata: ${error.message}`);
    }
  };

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
                  <li key={option.id} className="text-gray-700">
                    <label>
                      <input 
                        type="radio" 
                        name={`option-${survey.id}`} 
                        value={option.id}
                        onChange={() => setSelectedOption((prev) => ({ ...prev, [survey.id]: option.id }))}
                        className="mr-2"
                      />
                      {option.option_text}: {option.votes} oy
                    </label>
                  </li>
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
              <button 
                className="mt-2 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200"
                onClick={() => handleVote(survey.id)}
              >
                Oy Ver
              </button>
              {message && <p className="mt-4 text-center text-red-500">{message}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
