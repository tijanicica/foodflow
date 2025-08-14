import axios from 'axios';

const API_KEY = "d5ecc7a49e6b489b911416cad59b056a";

export const geocodeAddress = async (address) => {
  // === ISPRAVKA: Koristimo backticks (`) za template string ===
  const queryString = `${address.street} ${address.streetNumber}, ${address.postalCode} ${address.city}, ${address.country}`;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(queryString)}&key=${API_KEY}&limit=1`;

  try {
    const response = await axios.get(url);
    
    if (response.data && response.data.results.length > 0) {
      const result = response.data.results[0];
      if (result.confidence < 7) {
        throw new Error("Address is not precise enough. Please check your input.");
      }
      const { lat, lng } = result.geometry;
      return { latitude: lat, longitude: lng };
    } else {
      throw new Error("Address not found. Please check your input.");
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error(error.message || "An error occurred during geocoding.");
  }
};