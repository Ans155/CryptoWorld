import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, Title, Tooltip, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.min.css';

Chart.register(LineElement, PointElement, LinearScale, Title, Tooltip, TimeScale);

const CoinGeckoGraph = () => {
  const [priceData, setPriceData] = useState([]);
  const [currency, setCurrency] = useState('usd');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const symbol = 'tether';
        const vsCurrency = currency.toLowerCase(); // Use the selected currency
        const days = 30;

        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/tether/market_chart`,
          {
            params: {
              vs_currency: vsCurrency,
              days: days,
            },
          }
        );

        const formattedData = response.data.prices.map(price => ({
          x: new Date(price[0]),
          y: price[1],
        }));


        const filteredData = formattedData.reduce((acc, dataPoint) => {
          const dateKey = dataPoint.x.toDateString();
          if (!acc[dateKey]) {
            acc[dateKey] = dataPoint;
          }
          return acc;
        }, {});


        const finalData = Object.values(filteredData);

        setPriceData(finalData);
      } catch (error) {
        console.error('Error fetching CoinGecko data:', error);
      }
    };

    fetchData();
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency(prevCurrency => (prevCurrency === 'usd' ? 'inr' : 'usd'));
  };

  const chartData = {
    datasets: [
      {
        label: `Daily Price (${currency.toUpperCase()})`,
        data: priceData,
        borderColor: 'blue',
        fill: false,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM d',
          },
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        type: 'linear',
        ticks: {
          beginAtZero: true,
        },
        title: {
          display: true,
          text: `Price (${currency.toUpperCase()})`,
        },
      },
    },
  };

  const cardStyle = {
    maxWidth: '800px',
    margin: 'auto',
    marginTop: '20px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  };

  return (
    <div style={{ backgroundColor: 'blue', minHeight: '100vh', width: '100%' }}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark d-flex justify-content-around mb-4">
        <h1 className="navbar-brand">Welcome To CryptoWorld!</h1>
        <button className="btn btn-secondary" onClick={toggleCurrency}>
          {currency==='usd' ? (
            "USD"
          ) : (
            "INR"
          )}
        </button>
      </nav>
      <div className="container">
        <div className="card" style={cardStyle}>
          <div className="card-body">
            <h2 className="card-title">GSDT Daily Price Chart (Past Month)</h2>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinGeckoGraph;
