"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

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

export default function SurveyDetailPage() {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [voteCounts, setVoteCounts] = useState<{ [key: number]: number }>({});
  const { id } = useParams();

  useEffect(() => {
    const fetchSurvey = async () => {
      const response = await fetch(`/api/surveys/${id}`);
      const data = await response.json();
      if (response.ok) {
        setSurvey(data);
        const initialVoteCounts = data.options.reduce((acc: { [key: number]: number }, option: SurveyOption) => {
          acc[option.id] = option.votes;
          return acc;
        }, {});
        setVoteCounts(initialVoteCounts);
      }
    };

    fetchSurvey();
  }, [id]);

  const handleVote = async () => {
    if (selectedOption === null) {
      setMessage('Lütfen bir seçenek seçin');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/surveys/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ optionId: selectedOption }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Oy başarıyla kullanıldı!');
        setVoteCounts((prev) => ({
          ...prev,
          [selectedOption]: prev[selectedOption] + 1,
        }));
      } else {
        setMessage(`Hata: ${data.error || 'Oy kullanma başarısız.'}`);
      }
    } catch (error: any) {
      console.error("Oy kullanma hatası:", error);
      setMessage(`Hata: ${error.message}`);
    }
  };

  if (!survey) {
    return <div>Yükleniyor...</div>;
  }

  const data = {
    labels: survey.options.map(option => option.option_text),
    datasets: [
      {
        label: 'Oylar',
        data: survey.options.map(option => voteCounts[option.id]),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">{survey.title}</h1>
        <ul>
          {survey.options.map((option) => (
            <li key={option.id} className="mt-4 p-4 border rounded-lg shadow-sm">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="option"
                  value={option.id}
                  onChange={() => setSelectedOption(option.id)}
                  className="mr-2"
                />
                <span className="text-gray-800">{option.option_text}</span>
              </label>
            </li>
          ))}
        </ul>
        <button
          onClick={handleVote}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Oy Ver
        </button>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
        <div className="mt-8">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
