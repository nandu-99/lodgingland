import '@fortawesome/fontawesome-free/css/all.min.css';
import React, { useEffect, useRef, useState } from 'react';
import HotelCard from './hotelcard';
import Dropdown from './dropdown';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [cities, setCities] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const dropdownRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [show, setShow] = useState(false);
  const [isCitySelected, setIsCitySelected] = useState(false);

  // Handle user is logged in or not
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch city names
  useEffect(() => {
    const fetchCities = async () => {
      const projectId = 'treoo5dhf86s';
      try {
        const response = await fetch('https://academics.newtonschool.co/api/v1/bookingportals/city', {
          headers: { projectId }
        });
        const fetchedData = await response.json();
        const citiesList = fetchedData.data.cities.map(entry => entry.cityState.split(',')[0]);
        setCities(citiesList);
        setFilteredCities(citiesList);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
    const value = e.target.value;
    setQuery(value);
    setDropdownVisible(true);
    setIsCitySelected(false);
    const filtered = cities.filter(city => city.toLowerCase().includes(value.toLowerCase()));
    setFilteredCities(filtered.length > 0 ? filtered : ['City not found']);
  };

  // Check city is there or not
  const handleCityClick = async (city) => {
    if (!isLoggedIn) {
      window.location.href = '/signin';
    }
    if (city !== 'City not found') {
      setQuery(city);
      setDropdownVisible(false);
      setIsCitySelected(true);
      await fetchHotels(city, sortOption);
    }
  };

  // Fetch hotels data and sort option
  const fetchHotels = async (city, sort) => {
    try {
      let sortParam = '';
      switch (sort) {
        case 'Price (highest first)':
          sortParam = '{"avgCostPerNight":-1}';
          break;
        case 'Price (lowest first)':
          sortParam = '{"avgCostPerNight":1}';
          break;
        case 'Property rating (high to low)':
          sortParam = '{"rating":-1}';
          break;
        case 'Property rating (low to high)':
          sortParam = '{"rating":1}';
          break;
        default:
          sortParam = '';
          break;
      }
      const response = await fetch(`https://academics.newtonschool.co/api/v1/bookingportals/hotel?search={"location":"${city}"}${sortParam ? `&sort=${sortParam}` : ''}`, {
        method: 'GET',
        headers: {
          'projectId': 'treoo5dhf86s',
          'accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      setHotels(data.data.hotels);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  // Handle sort
  const handleSortSelect = (option) => {
    setSortOption(option);
    if (isCitySelected && query) {
      fetchHotels(query, option);
    }
  };

  // Handle search button click, tof
  const handleSearchButtonClick = () => {
    if (isCitySelected && query) {
      setShow(false);
      fetchHotels(query, sortOption).then(() => {
        setShow(true)
      });
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };

  // When cross is clicked
  const clearSelection = () => {
    setShow(false);
    setQuery('');
    setIsCitySelected(false);
    setFilteredCities(cities);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-screen mx-auto mt-10" ref={dropdownRef}>
      <div className='flex flex-col md:flex-row gap-9'>
        <div>
          <Dropdown onSelect={handleSortSelect} />
        </div>
        <div className="flex border-2 w-96 border-yellow-500 rounded-md overflow-hidden mb-[15px]">
          <div className="flex items-center pl-3 bg-white">
            <i className="fas fa-bed text-gray-500"></i>
          </div>
          <input
            type="text"
            className="flex-grow p-2 focus:outline-none"
            placeholder="Where are you going?"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setDropdownVisible(true)}
          />
          {query && (
            <button
              className="flex items-center justify-center bg-[white] text-gray-500 px-2 focus:outline-none"
              onClick={clearSelection}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
          <button 
            className={`bg-blue-500 text-white px-4 ${!isCitySelected ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSearchButtonClick}
            disabled={!isCitySelected}
          >
            Search
          </button>
        </div>
      </div>
      {dropdownVisible && (
        <ul className="relative bottom-5 left-[4px] md:relative md:bottom-5 md:left-[295px] w-[280px] bg-white border border-yellow-500 mt-1 max-h-40 overflow-y-auto z-20">
          {filteredCities.map((city, index) => (
            <li
              key={index}
              className={`p-2 cursor-pointer ${city !== 'City not found' ? 'hover:bg-yellow-100' : ''}`}
              onClick={() => handleCityClick(city)}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
        <div className="w-full h-[300px] flex flex-wrap gap-2.5 max-w-[1300px] mx-auto p-2.5 relative z-[-10]">
          {show && hotels.map((hotel) => (
            <HotelCard key={hotel._id} hotelInfo={hotel} room={hotel.rooms[0]} />
          ))}
      </div>
    </div>
  );
};

export default SearchBar;
