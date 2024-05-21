import '@fortawesome/fontawesome-free/css/all.min.css';
import React, { useEffect, useRef, useState } from 'react';

import HotelCard from './hotelcard';
import Dropdown from './dropdown';



const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [cities, setCities] = useState([]);
  const [hotels, sethotels] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const dropdownRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  console.log(isLoggedIn)


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);


  useEffect(() => {
    const fetchCities = async () => {
      const projectId = 'treoo5dhf86s'; 
      try {
        const response = await fetch('https://academics.newtonschool.co/api/v1/bookingportals/city', {
          headers: { projectId }
        });
        const fetcheddata = await response.json()
        const citiesList = fetcheddata.data.cities.map(entry => entry.cityState.split(',')[0]);
        // console.log(citiesList)
        setCities(citiesList);
        setFilteredCities(citiesList);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, []);

  const handleInputChange = (e) => {
    if (!isLoggedIn) {
      console.log("vikas")
      window.location.href = '/login';
    }
    const value = e.target.value;
    setQuery(value);
    setDropdownVisible(true);
    const filtered = cities.filter(city => city.toLowerCase().includes(value.toLowerCase()));
    setFilteredCities(filtered.length > 0 ? filtered : ['City not found']);
  };

    const handleCityClick = async (city) => {
      if (!isLoggedIn) {
        console.log("vikas")
        window.location.href = '/signin';
      }
      if (city !== 'City not found') {
        setQuery(city);
        setDropdownVisible(false);
    
        try {
          const response = await fetch(`https://academics.newtonschool.co/api/v1/bookingportals/hotel?search={"location":"${city}"}`, {
            method: 'GET',
            headers: {
              'projectId': 'treoo5dhf86s',
              'accept': 'application/json',
              'Content-Type': 'application/json',
            }
          });
          const data = await response.json();
          // console.log(data.data.hotels)
          sethotels(data.data.hotels)
        } catch (error) {
          console.error("Error fetching hotels:", error);
        }
      }
    };
  

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };

  const clearSelection = () => {
    setQuery('');
    setFilteredCities(cities);
  };

  const handleSortSelect = (option) => {
    setSortOption(option);
    const sortedHotels = [...hotels]; 
    console.log(sortedHotels)
    switch (option) {
      case 'Price (highest first)':
        sortedHotels.sort((a, b) => {
          const maxPriceA = Math.max(...a.rooms.map(room => room.price));
          const maxPriceB = Math.max(...b.rooms.map(room => room.price));
          return maxPriceB - maxPriceA;
        });
        break;
      case 'Price (lowest first)':
        sortedHotels.sort((a, b) => {
          const maxPriceA = Math.min(...a.rooms.map(room => room.price));
          const maxPriceB = Math.min(...b.rooms.map(room => room.price));
          return maxPriceA - maxPriceB;
        });
        break;
      case 'Property rating (high to low)':
        sortedHotels.sort((a, b) => b.rating - a.rating);
        break;
      case 'Property rating (low to high)':
        sortedHotels.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    sethotels(sortedHotels);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="relative w-screen mx-auto mt-10" ref={dropdownRef}>
      <div className='flex gap-9'>
        <div>
          <Dropdown onSelect={handleSortSelect}/>
          {/* insert dropdown here */}
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
          <button className="bg-blue-500 text-white px-4">
            Search
          </button>
        </div>
      </div>
      {dropdownVisible && (
        <ul className="absolute left-0 right-0 bg-white border border-yellow-500 mt-1 max-h-40 overflow-y-auto z-10">
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
      <div className='w-[1300px] flex flex-col gap-[10px]'>
        {hotels.map((hotel)=>{
          return hotel.rooms.map((room)=>{
            return <HotelCard key={room._id} hotelInfo={hotel} room={room} />
          })
        })}
      </div>
    </div>
  );
};

export default SearchBar;
