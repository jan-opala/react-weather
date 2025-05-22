import { useState } from "react";
import axios from 'axios';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image'
import Spinner from 'react-bootstrap/Spinner';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import './App.css';

export function Weather( {data} ) {
  var location, state, temperature, icon, humidity, wind, hourly;
  location = data.location;
  state = data.state;
  temperature = data.temperature;
  icon = data.icon;
  humidity = data.humidity;
  wind = data.wind;
  hourly = data.hourly;
  if (temperature === -200) {
    return (
    <Container className="text-center mt-5">
      <Spinner animation="grow" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </Container>
    );
  }
  if (temperature === -300) {
    return (
    <Container className="text-center mt-5">
      <h1>Wyszukaj lokalizację.</h1>
    </Container>
    );
  }
  if (temperature === -404) {
    return (
    <Container className="text-center mt-5">
      <h1>Błąd przy pobieraniu danych pogodowych.</h1>
    </Container>
    );
  }

  const listHourly = hourly.time.map((time, index) => {
    var temperature, icon, humidity, wind_speed, weather_code, cloud_cover, is_day;
    temperature = hourly.temperature_2m[index];
    humidity = hourly.relative_humidity_2m[index];
    wind_speed = hourly.wind_speed_10m[index];
    weather_code = hourly.weather_code[index];
    cloud_cover = hourly.cloud_cover[index];
    is_day = hourly.is_day[index];
    if ([17, 29, 91, 92, 93, 94, 95, 96, 99].includes(weather_code)) {
      icon="thunderstorm.svg";
    } else if ([20, 22, 23, 26, 36, 37, 38, 39, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 83, 84, 85, 86, 87, 88, 89, 90, 93, 94].includes(weather_code)) {
      icon="snow.svg";
    } else if ([20, 21, 22, 23, 24, 25, 26, 27, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 80, 81, 82, 83, 84, 85, 86, 91, 92].includes(weather_code)) {
      icon="rain.svg";
    } else if ([50, 51, 52, 53, 54, 55, 56, 57, 58, 59].includes(weather_code)) {
      icon="drizzle.svg";
    } else if ([5, 10, 28, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 76, 77, 78].includes(weather_code)) {
      icon="fog.svg";
    } else if (wind_speed >= 38) {
      icon="windy.svg";
    } else if (cloud_cover >= 80) {
      icon="cloudy.svg";
    } else if (cloud_cover >= 35) {
      icon="partly_cloudy.svg";
    } else if (cloud_cover >= 12) {
      icon="mostly_sunny.svg";
    } else if (temperature >= 33) {
      icon="sunny_hot.svg";
    } else if (is_day === 0) {
      icon="night.svg";
    } else {
      icon="sunny.svg";
    }
    return(

      <Col key={time}>
        <p className="text-small">{time.slice(11,13)}</p>
        <Image className="icon-small" src={`/weather_icons/` + icon} />
        <p className="text-small-temp text-secondary">{parseInt(temperature)}°C</p>
      </Col>

      );
  });

  return (
    <Container className="text-center mt-5">
      <Image className="icon" src={`/weather_icons/` + icon} />
      <h1>{location}</h1>
      <p className="state fs-8 text-secondary">{state}</p>
      <p className="fs-5 mt-2">Temperatura: {temperature}°C</p>
      <p className="next fs-5">Wilgotność: {humidity}%</p>
      <p className="next fs-5">Wiatr: {parseInt(wind)} km/h</p>
      <div className="overflow-auto ms-4 me-4 mt-5">
        <Row className="flex-nowrap">
          {listHourly}
        </Row>
      </div>
    </Container>
  );
}

export const fetcherWithAxios = async (url) => {
  const response = await axios.get(url);
  return response.data;
}
export const getWeather = async (loc) => {

  try {
    var user_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locData = await fetcherWithAxios(`https://nominatim.openstreetmap.org/search?q=${loc}&format=json&limit=1&featureType=city&addressdetails=1`);
    const location = `${locData[0].name}, ${locData[0].address.country}`;
    const state = locData[0].address.state || locData[0].address.province || locData[0].address.region;
    const lat = locData[0].lat;
    const lon = locData[0].lon;
    const weatherData = await fetcherWithAxios(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,cloud_cover,is_day,relative_humidity_2m&hourly=temperature_2m,weather_code,wind_speed_10m,cloud_cover,is_day,relative_humidity_2m&timezone=${user_timezone}&forecast_days=2`);
    const temperature = weatherData.current.temperature_2m;
    const weather_code = weatherData.current.weather_code;
    const wind_speed = weatherData.current.wind_speed_10m;
    const cloud_cover = weatherData.current.cloud_cover;
    const is_day = weatherData.current.is_day;
    const humidity = weatherData.current.relative_humidity_2m;

    var hourly = weatherData.hourly;
    var first = weatherData.current.time.slice(0, 14) + "00";
    hourly.time = hourly.time.filter((time => time >= first));
    hourly.time = hourly.time.slice(0, 25);

    var icon;
    if ([17, 29, 91, 92, 93, 94, 95, 96, 99].includes(weather_code)) {
      icon="thunderstorm.svg";
    } else if ([20, 22, 23, 26, 36, 37, 38, 39, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 83, 84, 85, 86, 87, 88, 89, 90, 93, 94].includes(weather_code)) {
      icon="snow.svg";
    } else if ([20, 21, 22, 23, 24, 25, 26, 27, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 80, 81, 82, 83, 84, 85, 86, 91, 92].includes(weather_code)) {
      icon="rain.svg";
    } else if ([50, 51, 52, 53, 54, 55, 56, 57, 58, 59].includes(weather_code)) {
      icon="drizzle.svg";
    } else if ([5, 10, 28, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 76, 77, 78].includes(weather_code)) {
      icon="fog.svg";
    } else if (wind_speed >= 38) {
      icon="windy.svg";
    } else if (cloud_cover >= 80) {
      icon="cloudy.svg";
    } else if (cloud_cover >= 35) {
      icon="partly_cloudy.svg";
    } else if (cloud_cover >= 12) {
      icon="mostly_sunny.svg";
    } else if (temperature >= 33) {
      icon="sunny_hot.svg";
    } else if (is_day === 0) {
      icon="night.svg";
    } else {
      icon="sunny.svg";
    }
    return({
      location: location,
      state: state,
      lat: lat,
      lon: lon,
      temperature: temperature,
      icon: icon,
      humidity: humidity,
      wind: wind_speed,
      hourly: hourly,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return {
      location: "",
      state: "",
      lat: "",
      lon: "",
      temperature: -404,
      icon: "",
      humidity: 0,
      wind: 0,
      hourly: {},
    };
  } finally {}  

};

const App = () => {
  const [data, setData] = useState({temperature: -300});
  
  const onFormSubmit = async(e) => {
    setData({temperature: -200}); // Set loading state
    e.preventDefault()
    const formData = new FormData(e.target),
    formDataObj = Object.fromEntries(formData.entries())
    const weatherData = await getWeather(formDataObj.locationInput);
    setData(weatherData); // Set the fetched data
    e.target.reset(); // Reset the form
  }

  return (
    <Container>

      <Container className="search mt-5 justify-content-center">
        <Form className="ms-4 me-4 d-flex" onSubmit={onFormSubmit}>

          <Form.Control autoComplete="off" className="me-3" name="locationInput" type="text" placeholder="Miasto, Kraj" />
          <Button variant="primary" type="submit">
            Szukaj
          </Button>

        </Form>
      </Container>
      
      <Weather data={data} />

    </Container>
  );
}

export default App;
