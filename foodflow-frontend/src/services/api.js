// src/services/api.js
import axios from 'axios';

// Osnovna konfiguracija za axios
const apiClient = axios.create({
  baseURL: 'http://localhost:8088/api', // Osnovni URL tvog Spring Boot servera
  headers: {
    'Content-Type': 'application/json',
  },
     paramsSerializer: params => {
        const searchParams = new URLSearchParams();
        for (const key in params) {
            const value = params[key];
            if (Array.isArray(value)) {
                value.forEach(item => searchParams.append(key, item));
            } else {
                searchParams.append(key, value);
            }
        }
        return searchParams.toString();
    }
});


apiClient.interceptors.request.use(
  (config) => {
    // Pročitaj token iz Local Storage
    const token = localStorage.getItem('jwtToken');
    
    // Ako token postoji, dodaj ga u Authorization heder
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config; // Vrati modifikovanu konfiguraciju da bi se zahtev nastavio
  },
  (error) => {
    // Uradi nešto sa greškom u zahtevu
    return Promise.reject(error);
  }
);

// Funkcija za login
export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    // Ako je login uspešan, čuvamo token u Local Storage
    if (response.data.token) {
      localStorage.setItem('jwtToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    // Prosleđujemo grešku dalje da je komponenta obradi
    throw error;
  }
};


export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    // Prosleđujemo celu grešku da bismo mogli da pročitamo poruku sa servera
    throw error;
  }
};



export const getFilteredRestaurants = async (filters) => {
  const response = await apiClient.post('/restaurants/filter', filters);
  return response.data;
};

export const getAllergens = async () => {
  const response = await apiClient.get('/restaurants/allergens');
  return response.data;
};

export const getDietTypes = async () => {
  const response = await apiClient.get('/restaurants/diet-types');
  return response.data;
};

export const getActiveMenu = async (restaurantId, filters) => {
  // Prosleđujemo filtere kao query parametre
  const response = await apiClient.get(`/restaurants/${restaurantId}/menu`, {
    params: {
      dietTypeIds: filters.dietTypeIds,
      excludeAllergenIds: filters.excludeAllergenIds,
    }
  });
  return response.data;
};