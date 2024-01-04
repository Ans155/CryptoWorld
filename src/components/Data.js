import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.min.css';

const CoinGeckoGraph = () => {
  const [priceData, setPriceData] = useState([]);
  const [currency, setCurrency] = useState('usd');
  const [selectedOption, setSelectedOption] = useState('month');

  const fetchData = async () => {
    try {
      const symbol = 'tether';
      const vsCurrency = currency.toLowerCase();
      const days = selectedOption === 'month' ? 30 : (selectedOption === 'week' ? 7 : 1);

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
        const dateKey = selectedOption === 'month' ? dataPoint.x.toISOString().slice(0, 10) : (selectedOption === 'week' ? dataPoint.x.toISOString().slice(0, 10) : dataPoint.x.toISOString().slice(0, 13));
        if (!acc[dateKey]) {
          acc[dateKey] = dataPoint.y; 
        }
        return acc;
      }, {});


      const finalData = Object.keys(filteredData).map(date => ({
        x: date,
        y: filteredData[date],
      }));

      setPriceData(finalData);
    } catch (error) {
      console.error('Error fetching CoinGecko data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currency, selectedOption]);

  const toggleCurrency = () => {
    setCurrency(prevCurrency => (prevCurrency === 'usd' ? 'inr' : 'usd'));
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const chartOptions = {
    xaxis: {
      type: selectedOption === 'month' ? 'datetime' : 'category',
      labels: {
        show: true,
        formatter: function (val) {
          return selectedOption === 'month' ? new Date(val).toLocaleDateString() : val;
        },
      },
      title: {
        text: selectedOption === 'month' ? 'Date' : (selectedOption === 'today' ? 'Hour' : 'Time'),
      },
    },
    yaxis: {
      title: {
        text: `Price (${currency.toUpperCase()})`,
      },
      labels: {
        formatter: function (val) {
          return val.toFixed(2);
        },
      },
    },
  };

  const chartSeries = [
    {
      name: `Daily Price (${currency.toUpperCase()})`,
      data: priceData,
    },
  ];

  const cardStyle = {
    maxWidth: '1000px',
    margin: 'auto',
    marginTop: '20px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg, #4A90E2, #00BFFF)' }}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark d-flex justify-content-around mb-4">
        <h1 className="navbar-brand">Welcome To CryptoWorld!</h1>
        <div style={{ margin: '10px' }}>
          <label htmlFor="timeDropdown" style={{ marginRight: '10px', color: 'white' }}>Select Time Period:</label>
          <select id="timeDropdown" value={selectedOption} onChange={handleOptionChange}>
            <option value="month">Month</option>
            <option value="week">7 Days</option>
            <option value="today">Today</option>
          </select>
        </div>
        <button className="btn btn-secondary" onClick={toggleCurrency}>
          {currency === 'usd' ? 'USD' : 'INR'}
        </button>
        <button className="btn btn-success" onClick={handleRefresh}>
          Refresh
        </button>
      </nav>
      <div className="container">
        <div className="card" style={cardStyle}>
          <div className="card-body">
            <h2 className="card-title">GSDT Daily Price Chart ({selectedOption === 'month' ? 'Past Month' : (selectedOption === 'week' ? 'Past 7 Days' : 'Today')})</h2>
            <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={450} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinGeckoGraph;
