import { useState } from "react";
import "./App.css";
import cities from "./data/indiaCities.json";

function getRiskClass(weather) {
  const temperature = Number(weather.temperature);
  const description = String(weather.description || "").toLowerCase();

  if (
    temperature >= 40 ||
    description.includes("thunderstorm") ||
    description.includes("tornado") ||
    description.includes("extreme")
  ) {
    return "risk";
  }

  if (
    temperature >= 35 ||
    description.includes("rain") ||
    description.includes("drizzle") ||
    description.includes("mist")
  ) {
    return "caution";
  }

  return "safe";
}

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [showCities, setShowCities] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredCities = cities
    .filter((item) =>
      item.name.toLowerCase().includes(city.toLowerCase())
    )
    .slice(0, 100);

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity.name);
    setShowCities(false);
    setWeather(null);
    setError("");
  };

  const handleSearch = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setWeather(null);
    setError("");
    setShowCities(false);
    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/weather?city=${encodeURIComponent(city)}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to get weather data.");
        return;
      }

      setWeather(data);
    } catch {
      setError("Unable to connect to the weather server.");
    } finally {
      setLoading(false);
    }
  };

  const riskClass = weather ? getRiskClass(weather) : "default";

  return (
    <div className={`app ${riskClass}`}>
      <main className="weather-container">
        <header className="brand">
          <div className="logo">
            <span className="logo-icon">🌤️</span>
            <span>WeatherNow</span>
          </div>
          <p className="subtitle">Climate & Temperature Dashboard</p>
          <p className="description">
            Search a city to view its climate condition and temperature in a
            clear, professional dashboard.
          </p>
        </header>

        <div className="search-wrapper">
          <div className="search-box">
            <input
              type="text"
              value={city}
              placeholder="Enter city name..."
              onFocus={() => setShowCities(true)}
              onChange={(event) => {
                setCity(event.target.value);
                setShowCities(true);
                setWeather(null);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
                if (event.key === "Escape") setShowCities(false);
              }}
            />
            <button onClick={handleSearch} disabled={loading}>
              {loading ? "Checking..." : "Search"}
            </button>
          </div>

          {showCities && city.trim() && (
            <div className="city-dropdown">
              {filteredCities.length > 0 ? (
                filteredCities.map((item) => (
                  <div
                    key={item.id}
                    className="city-option"
                    onMouseDown={() => handleCitySelect(item)}
                  >
                    <span className="city-name">{item.name}</span>
                    <span className="city-state">{item.state}</span>
                  </div>
                ))
              ) : (
                <div className="no-city">No Indian city found</div>
              )}
            </div>
          )}
        </div>

        {error && <div className="result-message">{error}</div>}

        {weather && (
          <section className="weather-result">
            <h1>
              {weather.city}, {weather.country}
            </h1>

            <img
              className="weather-icon"
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
            />

            <div className="temperature">{weather.temperature}°C</div>

            <div className="condition">{weather.description}</div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
