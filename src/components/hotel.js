import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const HotelDetails = () => {
  const { hotelId } = useParams();
  console.log(2, hotelId)
  const [hotelInfo, setHotelInfo] = useState(null);

  useEffect(() => {
    const fetchHotelInfo = async () => {
      try {
        const response = await fetch(`https://academics.newtonschool.co/api/v1/bookingportals/hotel/${hotelId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                projectId: "treoo5dhf86s",
                },
        });
        const data = await response.json();
        console.log(data.data)
        setHotelInfo(data.data);
      } catch (error) {
        console.error('Error fetching hotel info:', error);
      }
    };

    fetchHotelInfo();
  }, [hotelId]);

  if (!hotelInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{hotelInfo.name}</h2>
      <p>Location: {hotelInfo.location}</p>
      <p>Price: {hotelInfo.avgCostPerNight}</p>
    </div>
  );
};

export default HotelDetails;
