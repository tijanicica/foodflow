function useUpdateDriverLocation(onLocationChange) {
  useEffect(() => {
    let watchId;

    const sendLocation = async (latitude, longitude) => {
      try {
        await axios.put('http://localhost:8088/api/drivers/location', {
          latitude,
          longitude
        });
      } catch (error) {
        console.error("Error updating location:", error);
      }
    };

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (onLocationChange) onLocationChange({ lat: latitude, lng: longitude });
          sendLocation(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        }
      );
    } else {
      console.error("Geolocation is not available in this browser");
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [onLocationChange]);
}

export default useUpdateDriverLocation;
