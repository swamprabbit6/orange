const apiKey = 'b2e3d9f10892e885ca87a62ea7991bc9';
const forecastContainer = document.querySelector('#forecast');

const getWeatherForecast = (searchTerm) => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchTerm}&units=imperial&appid=${apiKey}`;
  
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const forecast = data.list.reduce((acc, item) => {
          const date = item.dt_txt.split(' ')[0];
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(item);
          return acc;
        }, {});
  // The following variables and code return the correct information from the API and posts it on the page
        const forecastHtml = Object.keys(forecast).map(date => {
          const items = forecast[date];
          const dateObj = new Date(items[0].dt_txt);
          const weekday = dateObj.toLocaleString('en-US', { weekday: 'long' });
          const iconUrl = `https://openweathermap.org/img/w/${items[0].weather[0].icon}.png`;
          const highTemp = Math.round(Math.max(...items.map(item => item.main.temp_max)));
          const lowTemp = Math.round(Math.min(...items.map(item => item.main.temp_min)));
          const humidity = Math.round(Math.max(...items.map (item => item.main.humidity)));
          const windSpeed = Math.round(Math.max(...items.map (item => item.wind.speed)));
  //class 'day' is stylized in the CSS
          return `
            <div class="day">
              <h3>${weekday}</h3>
              <p><img src="${iconUrl}" alt="${items[0].weather[0].description}"></p>
              <p>High: ${highTemp}&deg;F</p>
              <p>Low: ${lowTemp}&deg;F</p>
              <p>Humidity: ${humidity}&deg;F </p>
              <p>Wind Speed: ${windSpeed}&deg;F </p>
            </div>
          `;
        }).join('');
  
        forecastContainer.innerHTML = forecastHtml;
  
        // Save search term to local storage
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        if (!searchHistory.includes(searchTerm)) {
          searchHistory.push(searchTerm);
          localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        }

        loadPage()
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        //forecastContainer.innerHTML = '<p>Error fetching weather data. Please try again later.</p>';
      });
  };


//The loadPage function only appends the search history when the page is refreshed and no longer lets you click on the search term
const loadPage = () => {
    // Load search history from local storage
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
  
    // Create a list of search history items
    const historyList = searchHistory.map(searchTerm => {
      return `
        <li>
          <button class="search-history-btn">${searchTerm}</button>
        </li>
      `;
    }).join('');
  
    // Insert the search history list into the page
    const searchHistoryContainer = document.getElementById('search-history');
    searchHistoryContainer.innerHTML = historyList;
  
    // Add click event listener to search history buttons
    const searchHistoryButtons = document.getElementsByClassName('search-history-btn');
    for (let i = 0; i < searchHistoryButtons.length; i++) {
      searchHistoryButtons[i].addEventListener('click', (e) => {
        console.log(e.target)
        getWeatherForecast(e.target.textContent);
      });
    }
  };
  
loadPage();

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-input');

form.addEventListener('submit', e => {
  e.preventDefault();
  const searchTerm = input.value.trim();
  if (searchTerm.length === 0) {
    return;
  }
  getWeatherForecast(searchTerm);
});