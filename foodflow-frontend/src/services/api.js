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


// --- ORDER ---
export const createOrder = async (orderData) => {
    // Nema potrebe za ručnim dodavanjem tokena, interceptor to radi.
    const response = await apiClient.post('/orders', orderData);
    return response.data;
};

// --- ADDRESS ---
export const getMyAddresses = async () => {
    const response = await apiClient.get('/addresses/my');
    return response.data;
};

export const addNewAddress = async (addressData) => {
    const response = await apiClient.post('/addresses', addressData);
    return response.data;
};

// --- COUPON ---
export const getMyCoupons = async () => {
    const response = await apiClient.get('/coupons/my');
    return response.data;
}

export const getDriverPerformance = async () => {
    try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch('/api/drivers/performance', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Ključno: Šaljemo token!
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch performance data');
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error fetching driver performance:", error);
        throw error;
    }
};
export const updateDriverStatus = async (statusData) => {
  try {
    const token = localStorage.getItem('jwtToken');
    if (!token) throw new Error('No token found');

    const response = await fetch('/api/drivers/status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(statusData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update status: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in updateDriverStatus:", error);
    throw error;
  }
};


/**
 * Ažurira tip vozila za prijavljenog vozača.
 * @param {object} vehicleData - Objekat sa novim vozilom, npr. { newVehicleType: 'MOTORCYCLE' }
 */
export const updateDriverVehicle = async (vehicleData) => {
    try {
        const token = localStorage.getItem('jwtToken');
        if (!token) throw new Error('No token found');

        const response = await fetch('/api/drivers/vehicle', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(vehicleData)
        });

        if (!response.ok) {
            throw new Error(`Failed to update vehicle: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error in updateDriverVehicle:", error);
        throw error;
    }
};

export const getDriverDashboard = async () => {
    try {
        const token = localStorage.getItem('jwtToken');
        if (!token) throw new Error('No token found');

        const response = await fetch('/api/drivers/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
    }
};

/**
 * Šalje zahtjev za prihvatanje ponude.
 * @param {number} offerId ID ponude koja se prihvata.
 */
export const acceptOffer = async (offerId) => {
    try {
        const token = localStorage.getItem('jwtToken');
        if (!token) throw new Error('No token found');

        const response = await fetch(`/api/drivers/offers/${offerId}/accept`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Failed to accept offer: ${response.statusText}`);
        }
        return response.ok;
    } catch (error) {
        console.error("Error accepting offer:", error);
        throw error;
    }
};

/**
 * Šalje zahtjev za odbijanje ponude.
 * @param {number} offerId ID ponude koja se odbija.
 * @param {string|null} reason Opcionalni razlog odbijanja.
 */
export const rejectOffer = async (offerId, reason = null) => {
    try {
        const token = localStorage.getItem('jwtToken');
        if (!token) throw new Error('No token found');

        const body = reason ? JSON.stringify({ reason }) : null;

        const response = await fetch(`/api/drivers/offers/${offerId}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: body
        });

        if (!response.ok) {
            throw new Error(`Failed to reject offer: ${response.statusText}`);
        }
        return response.ok;
    } catch (error) {
        console.error("Error rejecting offer:", error);
        throw error;
    }
};