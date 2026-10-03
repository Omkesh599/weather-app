/* =========================================
   OM WEATHER APP
   COMPLETE JAVASCRIPT
========================================= */


/* =========================================
   API CONFIGURATION
========================================= */

const API_KEY = "b8d42160ef9224a0f8c8d4addf5018eb";

const WEATHER_URL =
    "https://api.openweathermap.org/data/2.5";

const SEARCH_URL =
    "https://geocoding-api.open-meteo.com/v1/search";


/* =========================================
   GLOBAL VARIABLES
========================================= */

let currentWeatherData = null;

let currentForecastData = null;

let weatherClockInterval = null;

let suggestionTimeout = null;

let lightningInterval = null;


/* =========================================
   DOM ELEMENTS
========================================= */

const welcomeScreen =
    document.getElementById("welcomeScreen");

const appContainer =
    document.getElementById("appContainer");

const userForm =
    document.getElementById("userForm");

const userNameInput =
    document.getElementById("userName");

const userAgeInput =
    document.getElementById("userAge");

const displayName =
    document.getElementById("displayName");

const greeting =
    document.getElementById("greeting");

const currentDate =
    document.getElementById("currentDate");

const searchForm =
    document.getElementById("searchForm");

const cityInput =
    document.getElementById("cityInput");

const suggestions =
    document.getElementById("suggestions");

const locationBtn =
    document.getElementById("locationBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const changeUserBtn =
    document.getElementById("changeUserBtn");

const errorMessage =
    document.getElementById("errorMessage");

const errorText =
    document.getElementById("errorText");

const stars =
    document.getElementById("stars");

const rainContainer =
    document.getElementById("rainContainer");

const snowContainer =
    document.getElementById("snowContainer");

const lightning =
    document.getElementById("lightning");


/* =========================================
   USER FORM
========================================= */

userForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const name =
            userNameInput.value.trim();

        const age =
            Number(userAgeInput.value);


        if (!name) {

            alert(
                "Please enter your name."
            );

            return;
        }


        if (
            !age ||
            age < 1 ||
            age > 120
        ) {

            alert(
                "Please enter a valid age."
            );

            return;
        }


        localStorage.setItem(
            "omWeatherName",
            name
        );

        localStorage.setItem(
            "omWeatherAge",
            age
        );


        displayName.textContent =
            name;


        welcomeScreen.classList.add(
            "hidden"
        );

        appContainer.classList.remove(
            "hidden"
        );


        loadWeatherByCity(
            "Haridwar"
        );
    }
);


/* =========================================
   LOAD SAVED USER
========================================= */

window.addEventListener(
    "load",
    function () {

        const savedName =
            localStorage.getItem(
                "omWeatherName"
            );

        const savedAge =
            localStorage.getItem(
                "omWeatherAge"
            );


        if (
            savedName &&
            savedAge
        ) {

            displayName.textContent =
                savedName;

            userNameInput.value =
                savedName;

            userAgeInput.value =
                savedAge;


            welcomeScreen.classList.add(
                "hidden"
            );

            appContainer.classList.remove(
                "hidden"
            );


            loadWeatherByCity(
                "Haridwar"
            );
        }
    }
);


/* =========================================
   SEARCH FORM
========================================= */

searchForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const city =
            cityInput.value.trim();


        if (!city) {

            showError(
                "Please enter a city name."
            );

            return;
        }


        suggestions.classList.add(
            "hidden"
        );


        searchExactCity(city);
    }
);


/* =========================================
   SEARCH INPUT
========================================= */

cityInput.addEventListener(
    "input",
    function () {

        const query =
            cityInput.value.trim();


        clearTimeout(
            suggestionTimeout
        );


        if (query.length < 2) {

            suggestions.innerHTML = "";

            suggestions.classList.add(
                "hidden"
            );

            return;
        }


        suggestionTimeout =
            setTimeout(
                function () {

                    getCitySuggestions(
                        query
                    );

                },
                350
            );
    }
);


/* =========================================
   CLICK OUTSIDE SEARCH
========================================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                ".search-box"
            )
        ) {

            suggestions.classList.add(
                "hidden"
            );
        }
    }
);


/* =========================================
   OPEN-METEO CITY SUGGESTIONS
========================================= */

async function getCitySuggestions(
    query
) {

    try {

        const url =
            `${SEARCH_URL}?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "City search failed."
            );
        }


        const data =
            await response.json();


        if (
            !data.results ||
            data.results.length === 0
        ) {

            suggestions.innerHTML = `
                <div class="suggestion-item">
                    <div class="suggestion-info">
                        <span class="suggestion-city">
                            No cities found
                        </span>
                        <span class="suggestion-location">
                            Try another spelling
                        </span>
                    </div>
                </div>
            `;

            suggestions.classList.remove(
                "hidden"
            );

            return;
        }


        displaySuggestions(
            data.results
        );

    } catch (error) {

        console.error(
            "Suggestion error:",
            error
        );

        suggestions.classList.add(
            "hidden"
        );
    }
}


/* =========================================
   DISPLAY SUGGESTIONS
========================================= */

function displaySuggestions(
    cities
) {

    suggestions.innerHTML = "";


    cities.forEach(
        function (city) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "suggestion-item";


            const cityName =
                city.name ||
                "Unknown city";


            const region =
                city.admin1 ||
                "";


            const country =
                city.country ||
                "";


            const countryCode =
                city.country_code ||
                "";


            const locationText =
                [
                    region,
                    country
                ]
                .filter(Boolean)
                .join(", ");


            item.innerHTML = `
                <div class="suggestion-icon">
                    📍
                </div>

                <div class="suggestion-info">

                    <span class="suggestion-city">
                        ${escapeHTML(cityName)}
                    </span>

                    <span class="suggestion-location">
                        ${escapeHTML(locationText)}
                        ${countryCode ? ` (${escapeHTML(countryCode)})` : ""}
                    </span>

                </div>
            `;


            item.addEventListener(
                "click",
                function () {

                    cityInput.value =
                        cityName;


                    suggestions.classList.add(
                        "hidden"
                    );


                    loadWeatherByCoordinates(
                        city.latitude,
                        city.longitude
                    );
                }
            );


            suggestions.appendChild(
                item
            );
        }
    );


    suggestions.classList.remove(
        "hidden"
    );
}


/* =========================================
   EXACT CITY SEARCH
========================================= */

async function searchExactCity(
    cityName
) {

    try {

        showLoading();


        const url =
            `${SEARCH_URL}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Could not search for this city."
            );
        }


        const data =
            await response.json();


        if (
            !data.results ||
            data.results.length === 0
        ) {

            throw new Error(
                `City "${cityName}" was not found.`
            );
        }


        const city =
            data.results[0];


        cityInput.value =
            city.name;


        await loadWeatherByCoordinates(
            city.latitude,
            city.longitude
        );

    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Unable to find city."
        );
    }
}


/* =========================================
   LOAD WEATHER BY CITY
========================================= */

async function loadWeatherByCity(
    cityName
) {

    try {

        const url =
            `${SEARCH_URL}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Could not find city."
            );
        }


        const data =
            await response.json();


        if (
            !data.results ||
            data.results.length === 0
        ) {

            throw new Error(
                "City not found."
            );
        }


        const city =
            data.results[0];


        cityInput.value =
            city.name;


        await loadWeatherByCoordinates(
            city.latitude,
            city.longitude
        );

    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Unable to load weather."
        );
    }
}


/* =========================================
   LOAD WEATHER BY COORDINATES
========================================= */

async function loadWeatherByCoordinates(
    latitude,
    longitude
) {

    try {

        showLoading();


        if (
            !API_KEY ||
            API_KEY ===
            "YOUR_NEW_OPENWEATHER_API_KEY"
        ) {

            throw new Error(
                "Please add your new OpenWeather API key in script.js."
            );
        }


        const weatherURL =
            `${WEATHER_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;


        const forecastURL =
            `${WEATHER_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;


        const [
            weatherResponse,
            forecastResponse
        ] =
            await Promise.all([
                fetch(weatherURL),
                fetch(forecastURL)
            ]);


        if (
            weatherResponse.status === 401 ||
            forecastResponse.status === 401
        ) {

            throw new Error(
                "OpenWeather API key is invalid or not activated yet."
            );
        }


        if (
            weatherResponse.status === 429 ||
            forecastResponse.status === 429
        ) {

            throw new Error(
                "OpenWeather API request limit reached. Please try again later."
            );
        }


        if (
            !weatherResponse.ok
        ) {

            throw new Error(
                "Unable to load current weather."
            );
        }


        if (
            !forecastResponse.ok
        ) {

            throw new Error(
                "Unable to load forecast."
            );
        }


        const weather =
            await weatherResponse.json();


        const forecast =
            await forecastResponse.json();


        currentWeatherData =
            weather;


        currentForecastData =
            forecast;


        displayWeather(
            weather
        );


        displayHourlyForecast(
            forecast
        );


        displayFiveDayForecast(
            forecast
        );


        updateActivities(
            weather
        );


        updateGreeting(
            weather.timezone
        );


        updateDate(
            weather.timezone
        );


        updateLocalTime(
            weather.timezone
        );


        setWeatherBackground(
            weather
        );


        hideError();

    } catch (error) {

        console.error(
            "Weather error:",
            error
        );


        showError(
            error.message ||
            "Unable to load weather."
        );
    }
}


/* =========================================
   DISPLAY CURRENT WEATHER
========================================= */

function displayWeather(
    data
) {

    const weather =
        data.weather[0];


    const main =
        data.main;


    const wind =
        data.wind;


    document.getElementById(
        "locationName"
    ).textContent =
        data.name;


    document.getElementById(
        "countryName"
    ).textContent =
        data.sys.country || "";


    document.getElementById(
        "temperature"
    ).textContent =
        `${Math.round(main.temp)}°`;


    document.getElementById(
        "feelsLike"
    ).textContent =
        `${Math.round(main.feels_like)}°`;


    document.getElementById(
        "weatherDescription"
    ).textContent =
        weather.description;


    document.getElementById(
        "weatherEmoji"
    ).textContent =
        getWeatherEmoji(
            weather.id
        );


    document.getElementById(
        "humidity"
    ).textContent =
        `${main.humidity}%`;


    const windSpeed =
        Number(wind.speed || 0) * 3.6;


    document.getElementById(
        "windSpeed"
    ).textContent =
        `${windSpeed.toFixed(1)} km/h`;


    document.getElementById(
        "windDirection"
    ).textContent =
        getWindDirection(
            wind.deg
        );


    document.getElementById(
        "pressure"
    ).textContent =
        `${main.pressure} hPa`;


    const visibility =
        data.visibility
            ? data.visibility / 1000
            : 0;


    document.getElementById(
        "visibility"
    ).textContent =
        `${visibility.toFixed(1)} km`;


    document.getElementById(
        "sunrise"
    ).textContent =
        formatTime(
            data.sys.sunrise,
            data.timezone
        );


    document.getElementById(
        "sunset"
    ).textContent =
        formatTime(
            data.sys.sunset,
            data.timezone
        );


    document.getElementById(
        "minMax"
    ).textContent =
        `${Math.round(main.temp_min)}° / ${Math.round(main.temp_max)}°`;
}


/* =========================================
   WEATHER EMOJI
========================================= */

function getWeatherEmoji(
    weatherId
) {

    if (
        weatherId >= 200 &&
        weatherId <= 232
    ) {

        return "⛈️";
    }


    if (
        weatherId >= 300 &&
        weatherId <= 321
    ) {

        return "🌦️";
    }


    if (
        weatherId >= 500 &&
        weatherId <= 531
    ) {

        return "🌧️";
    }


    if (
        weatherId >= 600 &&
        weatherId <= 622
    ) {

        return "❄️";
    }


    if (
        weatherId >= 701 &&
        weatherId <= 781
    ) {

        return "🌫️";
    }


    if (
        weatherId === 800
    ) {

        return "☀️";
    }


    if (
        weatherId === 801
    ) {

        return "🌤️";
    }


    if (
        weatherId === 802
    ) {

        return "⛅";
    }


    if (
        weatherId === 803 ||
        weatherId === 804
    ) {

        return "☁️";
    }


    return "🌤️";
}


/* =========================================
   CITY LOCAL TIME
========================================= */

function getCityDate(
    timezoneOffset = 0
) {

    return new Date(
        Date.now() +
        Number(timezoneOffset) * 1000
    );
}


/* =========================================
   UPDATE LOCAL CLOCK
========================================= */

function updateLocalTime(
    timezoneOffset
) {

    clearInterval(
        weatherClockInterval
    );


    function updateClock() {

        const cityDate =
            getCityDate(
                timezoneOffset
            );


        const hours =
            cityDate.getUTCHours();


        const minutes =
            cityDate.getUTCMinutes();


        const seconds =
            cityDate.getUTCSeconds();


        const hour12 =
            hours % 12 || 12;


        const ampm =
            hours >= 12
                ? "PM"
                : "AM";


        const formattedTime =
            `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${ampm}`;


        document.getElementById(
            "localTime"
        ).textContent =
            formattedTime;
    }


    updateClock();


    weatherClockInterval =
        setInterval(
            updateClock,
            1000
        );
}


/* =========================================
   UPDATE GREETING
========================================= */

function updateGreeting(
    timezoneOffset
) {

    const cityDate =
        getCityDate(
            timezoneOffset
        );


    const hour =
        cityDate.getUTCHours();


    let text;


    if (
        hour >= 5 &&
        hour < 12
    ) {

        text =
            "Good Morning";

    } else if (
        hour >= 12 &&
        hour < 17
    ) {

        text =
            "Good Afternoon";

    } else if (
        hour >= 17 &&
        hour < 21
    ) {

        text =
            "Good Evening";

    } else {

        text =
            "Good Night";
    }


    greeting.textContent =
        text;
}


/* =========================================
   UPDATE DATE
========================================= */

function updateDate(
    timezoneOffset
) {

    const cityDate =
        getCityDate(
            timezoneOffset
        );


    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];


    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];


    const day =
        days[
            cityDate.getUTCDay()
        ];


    const month =
        months[
            cityDate.getUTCMonth()
        ];


    const date =
        cityDate.getUTCDate();


    const year =
        cityDate.getUTCFullYear();


    currentDate.textContent =
        `${day}, ${month} ${date}, ${year}`;
}


/* =========================================
   FORMAT WEATHER TIME
========================================= */

function formatTime(
    unixTime,
    timezoneOffset = 0
) {

    if (!unixTime) {

        return "--";
    }


    const date =
        new Date(
            (Number(unixTime) +
                Number(timezoneOffset)) *
            1000
        );


    const hours =
        date.getUTCHours();


    const minutes =
        date.getUTCMinutes();


    const hour12 =
        hours % 12 || 12;


    const ampm =
        hours >= 12
            ? "PM"
            : "AM";


    return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
}


/* =========================================
   WEATHER BACKGROUND
========================================= */

function setWeatherBackground(
    data
) {

    document.body.classList.remove(
        "morning-bg",
        "day-bg",
        "evening-bg",
        "night-bg",
        "cloudy-bg",
        "rain-bg",
        "storm-bg",
        "snow-bg",
        "fog-bg"
    );


    stopWeatherEffects();


    const weatherId =
        Number(
            data.weather[0].id
        );


    /* THUNDERSTORM */

    if (
        weatherId >= 200 &&
        weatherId <= 232
    ) {

        document.body.classList.add(
            "storm-bg"
        );


        createRain();

        createLightning();

        return;
    }


    /* SNOW */

    if (
        weatherId >= 600 &&
        weatherId <= 622
    ) {

        document.body.classList.add(
            "snow-bg"
        );


        createSnow();

        return;
    }


    /* RAIN / DRIZZLE */

    if (
        weatherId >= 300 &&
        weatherId <= 531
    ) {

        document.body.classList.add(
            "rain-bg"
        );


        createRain();

        return;
    }


    /* FOG / MIST */

    if (
        weatherId >= 701 &&
        weatherId <= 781
    ) {

        document.body.classList.add(
            "fog-bg"
        );

        return;
    }


    /* CLOUDS */

    if (
        weatherId >= 801 &&
        weatherId <= 804
    ) {

        document.body.classList.add(
            "cloudy-bg"
        );

        return;
    }


    /* CLEAR SKY */

    if (
        weatherId === 800
    ) {

        setClearSkyBackground(
            data
        );

        return;
    }


    document.body.classList.add(
        "day-bg"
    );
}


/* =========================================
   CLEAR SKY TIME BACKGROUND
========================================= */

function setClearSkyBackground(
    data
) {

    const timezone =
        Number(
            data.timezone || 0
        );


    const currentLocal =
        new Date(
            (Number(data.dt) +
                timezone) *
            1000
        );


    const currentMinutes =
        currentLocal.getUTCHours() *
        60 +
        currentLocal.getUTCMinutes();


    const sunriseLocal =
        new Date(
            (Number(data.sys.sunrise) +
                timezone) *
            1000
        );


    const sunsetLocal =
        new Date(
            (Number(data.sys.sunset) +
                timezone) *
            1000
        );


    const sunriseMinutes =
        sunriseLocal.getUTCHours() *
        60 +
        sunriseLocal.getUTCMinutes();


    const sunsetMinutes =
        sunsetLocal.getUTCHours() *
        60 +
        sunsetLocal.getUTCMinutes();


    const morningEnd =
        sunriseMinutes + 120;


    const eveningStart =
        sunsetMinutes - 120;


    /* NIGHT */

    if (
        currentMinutes < sunriseMinutes ||
        currentMinutes >= sunsetMinutes
    ) {

        document.body.classList.add(
            "night-bg"
        );

        createStars();

        return;
    }


    /* MORNING */

    if (
        currentMinutes >= sunriseMinutes &&
        currentMinutes < morningEnd
    ) {

        document.body.classList.add(
            "morning-bg"
        );

        return;
    }


    /* EVENING */

    if (
        currentMinutes >= eveningStart &&
        currentMinutes < sunsetMinutes
    ) {

        document.body.classList.add(
            "evening-bg"
        );

        return;
    }


    /* DAY */

    document.body.classList.add(
        "day-bg"
    );
}


/* =========================================
   STARS
========================================= */

function createStars() {

    stars.innerHTML = "";


    for (
        let i = 0;
        i < 120;
        i++
    ) {

        const star =
            document.createElement(
                "div"
            );


        star.className =
            "star";


        star.style.left =
            `${Math.random() * 100}%`;


        star.style.top =
            `${Math.random() * 70}%`;


        star.style.animationDelay =
            `${Math.random() * 2}s`;


        star.style.opacity =
            `${0.3 + Math.random() * 0.7}`;


        stars.appendChild(
            star
        );
    }
}


/* =========================================
   RAIN
========================================= */

function createRain() {

    rainContainer.innerHTML = "";


    for (
        let i = 0;
        i < 110;
        i++
    ) {

        const drop =
            document.createElement(
                "div"
            );


        drop.className =
            "rain-drop";


        drop.style.left =
            `${Math.random() * 100}%`;


        drop.style.animationDuration =
            `${0.35 + Math.random() * 0.55}s`;


        drop.style.animationDelay =
            `${Math.random() * 2}s`;


        drop.style.opacity =
            `${0.2 + Math.random() * 0.7}`;


        rainContainer.appendChild(
            drop
        );
    }
}


/* =========================================
   SNOW
========================================= */

function createSnow() {

    snowContainer.innerHTML = "";


    for (
        let i = 0;
        i < 70;
        i++
    ) {

        const snow =
            document.createElement(
                "div"
            );


        snow.className =
            "snowflake";


        snow.textContent =
            "•";


        snow.style.left =
            `${Math.random() * 100}%`;


        snow.style.fontSize =
            `${8 + Math.random() * 13}px`;


        snow.style.animationDuration =
            `${5 + Math.random() * 7}s`;


        snow.style.animationDelay =
            `${Math.random() * 5}s`;


        snow.style.opacity =
            `${0.35 + Math.random() * 0.65}`;


        snowContainer.appendChild(
            snow
        );
    }
}


/* =========================================
   LIGHTNING
========================================= */

function createLightning() {

    clearInterval(
        lightningInterval
    );


    function flash() {

        lightning.classList.remove(
            "flash"
        );


        void lightning.offsetWidth;


        lightning.classList.add(
            "flash"
        );
    }


    function schedule() {

        const delay =
            6000 +
            Math.random() * 7000;


        lightningInterval =
            setTimeout(
                function () {

                    flash();

                    schedule();

                },
                delay
            );
    }


    schedule();
}


/* =========================================
   STOP WEATHER EFFECTS
========================================= */

function stopWeatherEffects() {

    stars.innerHTML = "";

    rainContainer.innerHTML = "";

    snowContainer.innerHTML = "";


    lightning.classList.remove(
        "flash"
    );


    clearTimeout(
        lightningInterval
    );
}


/* =========================================
   HOURLY FORECAST
========================================= */

function displayHourlyForecast(
    forecast
) {

    const container =
        document.getElementById(
            "hourlyForecast"
        );


    container.innerHTML = "";


    const list =
        forecast.list.slice(
            0,
            8
        );


    list.forEach(
        function (item) {

            const date =
                new Date(
                    item.dt * 1000
                );


            const hours =
                date.getUTCHours();


            const time =
                `${String(hours).padStart(2, "0")}:00`;


            const emoji =
                getWeatherEmoji(
                    item.weather[0].id
                );


            const temperature =
                Math.round(
                    item.main.temp
                );


            const pop =
                Math.round(
                    Number(item.pop || 0) * 100
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "hour-card";


            card.innerHTML = `
                <div class="hour-time">
                    ${time}
                </div>

                <div class="hour-icon">
                    ${emoji}
                </div>

                <div class="hour-temp">
                    ${temperature}°
                </div>

                <div class="rain-chance">
                    💧 ${pop}%
                </div>
            `;


            container.appendChild(
                card
            );
        }
    );
}


/* =========================================
   FIVE DAY FORECAST
========================================= */

function displayFiveDayForecast(
    forecast
) {

    const container =
        document.getElementById(
            "fiveDayForecast"
        );


    container.innerHTML = "";


    const grouped = {};


    forecast.list.forEach(
        function (item) {

            const date =
                new Date(
                    item.dt * 1000
                );


            const dateKey =
                `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;


            if (
                !grouped[dateKey]
            ) {

                grouped[dateKey] = [];
            }


            grouped[dateKey].push(
                item
            );
        }
    );


    const dates =
        Object.keys(
            grouped
        ).slice(
            0,
            5
        );


    dates.forEach(
        function (dateKey) {

            const items =
                grouped[dateKey];


            let selected =
                items[0];


            let smallestDifference =
                Infinity;


            items.forEach(
                function (item) {

                    const date =
                        new Date(
                            item.dt * 1000
                        );


                    const hour =
                        date.getUTCHours();


                    const difference =
                        Math.abs(
                            hour - 12
                        );


                    if (
                        difference <
                        smallestDifference
                    ) {

                        smallestDifference =
                            difference;

                        selected =
                            item;
                    }
                }
            );


            const date =
                new Date(
                    selected.dt * 1000
                );


            const dayNames = [
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat"
            ];


            const dayName =
                dayNames[
                    date.getUTCDay()
                ];


            let maxTemp =
                -Infinity;


            let minTemp =
                Infinity;


            items.forEach(
                function (item) {

                    maxTemp =
                        Math.max(
                            maxTemp,
                            item.main.temp_max
                        );


                    minTemp =
                        Math.min(
                            minTemp,
                            item.main.temp_min
                        );
                }
            );


            const emoji =
                getWeatherEmoji(
                    selected.weather[0].id
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "day-card";


            card.innerHTML = `
                <div class="day-name">
                    ${dayName}
                </div>

                <div class="day-icon">
                    ${emoji}
                </div>

                <div class="day-temp">
                    ${Math.round(maxTemp)}°
                    <span class="day-min">
                        ${Math.round(minTemp)}°
                    </span>
                </div>

                <div class="day-description">
                    ${selected.weather[0].description}
                </div>
            `;


            container.appendChild(
                card
            );
        }
    );
}


/* =========================================
   ACTIVITIES
========================================= */

function updateActivities(
    data
) {

    const container =
        document.getElementById(
            "activityContainer"
        );


    container.innerHTML = "";


    const temperature =
        Number(data.main.temp);


    const weatherId =
        Number(
            data.weather[0].id
        );


    let activities = [];


    if (
        weatherId >= 200 &&
        weatherId <= 599
    ) {

        activities = [
            {
                icon: "☕",
                title: "Indoor Relax",
                text: "A good time to stay indoors and relax."
            },
            {
                icon: "📚",
                title: "Read",
                text: "Enjoy some reading in a comfortable place."
            },
            {
                icon: "🎬",
                title: "Watch a Movie",
                text: "Perfect weather for an indoor movie."
            },
            {
                icon: "💻",
                title: "Work Indoors",
                text: "Use the weather as a chance to focus indoors."
            }
        ];

    } else if (
        temperature >= 30
    ) {

        activities = [
            {
                icon: "🏊",
                title: "Swimming",
                text: "Cool down with a refreshing swim."
            },
            {
                icon: "💧",
                title: "Stay Hydrated",
                text: "Carry water and avoid excessive heat."
            },
            {
                icon: "🌳",
                title: "Shaded Walk",
                text: "Take a short walk in a shaded area."
            },
            {
                icon: "🧢",
                title: "Sun Protection",
                text: "Use sunscreen and protect yourself from strong sun."
            }
        ];

    } else if (
        temperature >= 20
    ) {

        activities = [
            {
                icon: "🚶",
                title: "Walking",
                text: "Great conditions for a comfortable walk."
            },
            {
                icon: "🚴",
                title: "Cycling",
                text: "A pleasant day for a cycling session."
            },
            {
                icon: "🏞️",
                title: "Explore Outdoors",
                text: "Good conditions for exploring nearby places."
            },
            {
                icon: "📸",
                title: "Photography",
                text: "Capture some outdoor moments."
            }
        ];

    } else {

        activities = [
            {
                icon: "☕",
                title: "Hot Drink",
                text: "Warm up with your favorite hot drink."
            },
            {
                icon: "🧥",
                title: "Stay Warm",
                text: "Wear comfortable warm clothing outdoors."
            },
            {
                icon: "📖",
                title: "Reading",
                text: "A comfortable day for reading indoors."
            },
            {
                icon: "🎮",
                title: "Gaming",
                text: "Relax indoors with your favorite game."
            }
        ];
    }


    activities.forEach(
        function (activity) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "activity-card";


            card.innerHTML = `
                <div>
                    ${activity.icon}
                </div>

                <h3>
                    ${activity.title}
                </h3>

                <p>
                    ${activity.text}
                </p>
            `;


            container.appendChild(
                card
            );
        }
    );
}


/* =========================================
   WIND DIRECTION
========================================= */

function getWindDirection(
    degrees
) {

    if (
        degrees === undefined ||
        degrees === null
    ) {

        return "--";
    }


    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];


    const index =
        Math.round(
            degrees / 45
        ) % 8;


    return directions[
        index
    ];
}


/* =========================================
   MY LOCATION
========================================= */

locationBtn.addEventListener(
    "click",
    function () {

        if (
            !navigator.geolocation
        ) {

            showError(
                "Geolocation is not supported by your browser."
            );

            return;
        }


        locationBtn.textContent =
            "📍 Finding Location...";


        navigator.geolocation.getCurrentPosition(
            async function (position) {

                try {

                    const latitude =
                        position.coords.latitude;


                    const longitude =
                        position.coords.longitude;


                    await loadWeatherByCoordinates(
                        latitude,
                        longitude
                    );

                } finally {

                    locationBtn.textContent =
                        "📍 My Location";
                }
            },

            function (error) {

                console.error(
                    error
                );


                locationBtn.textContent =
                    "📍 My Location";


                showError(
                    "Unable to access your location. Please allow location permission and try again."
                );
            },

            {
                enableHighAccuracy: true,

                timeout: 10000,

                maximumAge: 300000
            }
        );
    }
);


/* =========================================
   REFRESH
========================================= */

refreshBtn.addEventListener(
    "click",
    function () {

        if (
            !currentWeatherData
        ) {

            loadWeatherByCity(
                "Haridwar"
            );

            return;
        }


        loadWeatherByCoordinates(
            currentWeatherData.coord.lat,
            currentWeatherData.coord.lon
        );
    }
);


/* =========================================
   CHANGE USER
========================================= */

changeUserBtn.addEventListener(
    "click",
    function () {

        welcomeScreen.classList.remove(
            "hidden"
        );


        appContainer.classList.add(
            "hidden"
        );


        userNameInput.value =
            localStorage.getItem(
                "omWeatherName"
            ) || "";


        userAgeInput.value =
            localStorage.getItem(
                "omWeatherAge"
            ) || "";
    }
);


/* =========================================
   LOADING
========================================= */

function showLoading() {

    hideError();
}


/* =========================================
   ERROR
========================================= */

function showError(
    message
) {

    errorText.textContent =
        message;


    errorMessage.classList.remove(
        "hidden"
    );
}


function hideError() {

    errorMessage.classList.add(
        "hidden"
    );
}


/* =========================================
   HTML ESCAPE
   Used for search suggestions
========================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}