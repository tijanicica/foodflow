// src/services/api.js
import axios from 'axios';
import { format } from 'date-fns';
import { jwtDecode } from 'jwt-decode'; // Dodajte ovaj import na vrh fajla

const formatForBackend = (date) => {
  if (!date) return null;
  // Formatiramo u "yyyy-MM-dd'T'HH:mm:ss", format koji Spring Boot LocalDateTime parser obožava
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
};

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

export const getMyOrders = async (tab) => {
    try {
        // Parametar se šalje kao 'params' objekat
        const response = await apiClient.get('/orders/my-orders', { params: { tab } });
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${tab} orders:`, error);
        throw error;
    }
};

export const getMyRepeatingOrders = async () => {
    try {
        const response = await apiClient.get('/orders/my-repeating-orders');
        return response.data;
    } catch (error) {
        console.error("Error fetching repeating orders:", error);
        throw error;
    }
};

export const getOrderDetails = async (orderId) => {
    try {
        const response = await apiClient.get(`drivers/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for order ${orderId}:`, error);
        throw error;
    }
};


export const getOrderDetailsCustomer = async (orderId) => {
    try {
        const response = await apiClient.get(`orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for order ${orderId}:`, error);
        throw error;
    }
};

export const toggleRepeatingOrderStatus = async (templateId) => {
    try {
        // PATCH zahtev vraća ažurirani objekat
        const response = await apiClient.patch(`/orders/repeating/${templateId}/toggle-status`);
        return response.data;
    } catch (error) {
        console.error("Error toggling repeating order status:", error);
        throw error;
    }
};
export const markOrderAsPickedUp = async (orderId) => {
    // Šaljemo prazan POST zahtev na novi endpoint.
    // Telo (body) nije potrebno.
    await apiClient.post(`/drivers/orders/${orderId}/pickup`);
};

export const startSimulation = async (orderId) => {
    // Šaljemo prazan POST zahtev na endpoint koji smo napravili
    await apiClient.post(`/drivers/orders/${orderId}/start-simulation`);
};


export const cancelRepeatingOrder = async (templateId) => {
    try {
        // DELETE zahtev ne vraća ništa
        await apiClient.delete(`/orders/repeating/${templateId}`);
    } catch (error) {
        console.error("Error canceling repeating order:", error);
        throw error;
    }
};

export const getDriverInfo = async () => {
    try {
        const response = await apiClient.get('/drivers/info');
        return response.data;
    } catch (error) {
        console.error("Error fetching driver info:", error);
        throw error; // Prosledi grešku dalje da bi se obradila
    }
};
export const updateDriverProfile = async (profileData) => {
    try {
        const response = await apiClient.put('/drivers/profile', profileData);
        
        return response.data;

    } catch (error) {

        console.error("Error updating driver profile:", error.response?.data || error.message);
        throw error; // Prosleđujemo grešku dalje
    }
};
export const getDriverStatus = async () => {
    try {
        const response = await apiClient.get('/drivers/status');
        
        return response.data;

    } catch (error) {
        console.error("Error fetching driver status:", error.response?.data || error.message);
        throw error;
    }
};

export const markOrderAsDelivered = async (orderId) => {
    // Šaljemo prazan POST zahtev na novi endpoint.
    await apiClient.post(`/drivers/orders/${orderId}/deliver`);
};

export const cancelDelivery = async (orderId, reason) => {
    try {
        const response = await apiClient.post(`/drivers/orders/${orderId}/cancel`, { reason });
        return response.data;
    } catch (error) {
        console.error("Error cancelling delivery:", error);
        throw error;
    }
};

export const getTrackingInfo = async (orderId) => {
    try {
        const response = await apiClient.get(`/orders/${orderId}/track`);
        return response.data;
    } catch (error) {
        console.error("Error fetching tracking info:", error);
        throw error;
    }
};

export const getMyAnalytics = async (params) => {
    try {
        const response = await apiClient.get('/analytics/my-analytics',{params});
        return response.data;
    } catch (error) {
        console.error("Error fetching analytics:", error);
        throw error;
    }
};

export const reportDelay = async (orderId, delayMinutes) => {
    await apiClient.post(`/drivers/orders/${orderId}/report-delay`, { delayMinutes });
};
  
export const getMyProfile = async () => {
    try {
        const response = await apiClient.get('/user/profile');
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};


export const addNewCard = async (cardData) => {
    try {
        const response = await apiClient.post('/user/cards', cardData);
        return response.data;
    } catch (error) {
        console.error("Error adding new card:", error);
        throw error;
    }
};


export const deleteCard = async (cardId) => {
    try {
        await apiClient.delete(`/user/cards/${cardId}`);
    } catch (error) {
        console.error(`Error deleting card with ID ${cardId}:`, error);
        throw error;
    }
};

export const updatePhoneNumber = async (phone) => { 
    try {
        const response = await apiClient.patch('/user/profile/phone', { phone });
        return response.data;
    } catch (error) {
        console.error("Error updating phone number:", error);
        throw error;
    }
};

export const changePassword = async (passwordData) => { 
    try {
        const response = await apiClient.post('/user/profile/change-password', passwordData);
        return response.data;
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
};

export const updateAddress = async (addressId, addressData) => {
    try {
        const response = await apiClient.put(`/addresses/${addressId}`, addressData);
        return response.data;
    } catch (error) {
        console.error(`Error updating address ${addressId}:`, error);
        throw error;
    }
};

export const setActiveCard = async (cardId) => {
    try {
        await apiClient.patch(`/user/cards/${cardId}/set-active`);
    } catch (error) {
        console.error("Error setting active card:", error);
        throw error;
    }
};

// U api.js

export const getManagerAnalytics = async (days = 30, restaurantId = null) => {
    const params = { days };
    // Šaljemo restaurantId samo ako ima vrednost (nije null, undefined, 0, ili prazan string)
    if (restaurantId) {
        params.restaurantId = restaurantId;
    }
    const response = await apiClient.get('/manager/analytics', { params });
    return response.data;
};

export const getMyRestaurants = async () => {
    const response = await apiClient.get('/manager/my-restaurants');
    return response.data;
};


// --- MANAGER PROFILE ---
export const getManagerProfile = async () => {
    try {
        const response = await apiClient.get('/manager/profile');
        return response.data;
    } catch (error) {
        console.error("Error fetching manager profile:", error);
        throw error;
    }
};

export const updateManagerProfile = async (profileData) => {
    try {
        const response = await apiClient.put('/manager/profile', profileData);
        return response.data;
    } catch (error) {
        console.error("Error updating manager profile:", error);
        throw error;
    }
};

export const changeManagerPassword = async (passwordData) => {
    // Ne očekujemo povratne podatke osim statusa
    await apiClient.post('/manager/profile/change-password', passwordData);
};
// --- MANAGER MENU MANAGEMENT ---

// --- MANAGER (MENU MANAGEMENT) ---
export const getManagerMenus = async () => {
    const response = await apiClient.get('/manager/menus');
    return response.data;
};

export const createManagerMenu = async (menuData) => {
    const response = await apiClient.post('/manager/menus', menuData);
    return response.data;
};

export const getMenuVersionDetails = async (menuVersionId) => {
    const response = await apiClient.get(`/manager/menus/${menuVersionId}`);
    return response.data;
};

export const updateMenuName = async (menuVersionId, menuData) => {
    const response = await apiClient.put(`/manager/menus/${menuVersionId}`, menuData);
    return response.data;
};

export const deactivateMenu = async (menuVersionId) => {
    await apiClient.post(`/manager/menus/${menuVersionId}/deactivate`);
};

export const activateMenu = async (menuVersionId) => {
    await apiClient.post(`/manager/menus/${menuVersionId}/activate`);
};

export const addMenuItem = async (menuVersionId, itemData) => {
    const response = await apiClient.post(`/manager/menus/${menuVersionId}/items`, itemData);
    return response.data;
};

export const sendChatMessage = async (message) => {
  try {
    const response = await apiClient.post('/ai/chat', { message });
    return response.data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
}

export const getManagerActiveOrders = async () => {
    const response = await apiClient.get('/manager/orders/active');
    return response.data;
};

export const confirmManagerOrder = async (orderId) => {
    await apiClient.post(`/manager/orders/${orderId}/confirm`);
};

export const rejectManagerOrder = async (orderId, reason) => {
    await apiClient.post(`/manager/orders/${orderId}/reject`, { reason });
};

export const markOrderAsReady = async (orderId) => {
    await apiClient.post(`/manager/orders/${orderId}/ready`);
};

export const getManagerDeliveries = async () => {
  const response = await apiClient.get('/manager/deliveries');
  return response.data;
};
export const getManagerTrackingInfo = async (orderId) => {
    // Mora biti unutar backtick ` navodnika, ne /
    const response = await apiClient.get(`/manager/deliveries/${orderId}/track`);
    return response.data;
};
  
export const rateDriverByManager = async (orderId, ratingData) => {
    const response = await apiClient.post(`/ratings/driver/${orderId}/restaurant`, ratingData);
    return response.data;
};
export const updateMenuItem = async (menuItemVersionId, itemData) => {
    const response = await apiClient.put(`/manager/menus/items/${menuItemVersionId}`, itemData);
    return response.data;
};

export const deleteMenuItem = async (menuItemVersionId) => {
    await apiClient.delete(`/manager/menus/items/${menuItemVersionId}`);
};
export const getAllManagers = async () => {
    const response = await apiClient.get('/admin/managers');
    return response.data;
};

export const registerManager = async (managerData) => {
    const response = await apiClient.post('/admin/managers', managerData);
    return response.data;
};
export const getManagerDetails = async (managerId) => {
    const response = await apiClient.get(`/admin/managers/${managerId}`);
    return response.data;
};

export const updateManager = async (managerId, managerData) => {
    const response = await apiClient.put(`/admin/managers/${managerId}`, managerData);
    return response.data;
};
export const rateOrder = async (orderId, payload) => {
    const response = await axiosInstance.put(`/orders/${orderId}/rate`, payload);
    return response.data;
};

export const getRestaurantOptions = async () => {
    const response = await apiClient.get('/restaurants/options');
    return response.data;
};

export const getOperators = async () => {
    const response = await apiClient.get('/support-admin/operators'); 
    return response.data;
};

/**
 * Registruje novog operatora (agenta).
 * @param {object} operatorData 
 */
export const registerOperator = async (operatorData) => {
    const response = await apiClient.post('/support-admin/register-operator', operatorData);
    return response.data;
};

export const getSupportAdminProfile = async () => {
    const response = await apiClient.get('/support-admin/profile');
    return response.data;
};

/**
 * Ažurira broj telefona support admina.
 * @param {string} phone - Novi broj telefona.
 */
export const updateSupportAdminPhone = async (phoneData) => {
    
    const response = await apiClient.patch('/support-admin/profile/phone', phoneData);
    return response.data;
};

/**
 * Menja lozinku support admina.
 * @param {object} passwordData - Objekat sa { oldPassword, newPassword }.
 */
export const changeSupportAdminPassword = async (passwordData) => {
    await apiClient.post('/support-admin/profile/change-password', passwordData);
};


export const getOperatorRankings = async () => {
    const response = await apiClient.get('/support-admin/operators/rankings');
    return response.data;
};

export const submitCombinedRating = async (orderId, payload) => {
    // Rešenje je ovde: koristimo `apiClient` koji je definisan na vrhu fajla
    const response = await apiClient.post(`/orders/${orderId}/rate`, payload); 
    return response.data;
};

export const getLiveDriverLocations = async () => {
    const response = await apiClient.get('/admin/managers/drivers/live-locations');
    return response.data;
};

export const registerDriver = async (driverData) => {
    const response = await apiClient.post('/admin/managers/drivers', driverData);
    return response.data;
};


export const getAllDriverPerformances = async () => {
    const response = await apiClient.get('/admin/managers/drivers-performance');
    return response.data;
};

export const getManagerLiveTracking = async () => {
    const response = await apiClient.get('/manager/live-tracking');
    return response.data;
};

export const getSupportAnalytics = async (dateRange) => {
  const params = new URLSearchParams();
  
  if (dateRange) {
    if (dateRange.from) {
      params.append('startDate', dateRange.from.toISOString());
    }
    if (dateRange.to) {
      const endDate = new Date(dateRange.to);
      endDate.setHours(23, 59, 59, 999);
      params.append('endDate', endDate.toISOString());
    }
  }

  const queryString = params.toString();
  console.log("Slanje upita na /analytics/support sa query stringom:", queryString);
    
    const response = await apiClient.get(`/support-analytics?${params.toString()}`); 
    return response.data;
};

export const getOperatorAnalytics = async (dateRange) => {
      const params = new URLSearchParams();
 if (dateRange?.from) {
    // Postavljamo vreme na početak dana
    const startDate = new Date(dateRange.from);
    startDate.setHours(0, 0, 0, 0);
    params.append('startDate', formatForBackend(startDate));
  }
  
  if (dateRange?.to) {
    // Postavljamo vreme na kraj dana da bi uključili ceo taj dan u pretragu
    const endDate = new Date(dateRange.to);
    endDate.setHours(23, 59, 59, 999);
    params.append('endDate', formatForBackend(endDate));
  }
    const response = await apiClient.get(`/operator/analytics?${params.toString()}`); 
    return response.data;
};

/* getOperatorProfile,
  updateOperatorPhone,
  changeOperatorPassword,*/

export const getOperatorProfile = async () => {
    const response = await apiClient.get('operator/profile');
    return response.data;
}


export const updateOperatorPhone = async (phoneData) => {
    const response = await apiClient.patch('/operator/profile/phone', phoneData);
    return response.data;
};

/**
 * Menja lozinku support admina.
 * @param {object} passwordData - Objekat sa { oldPassword, newPassword }.
 */
export const changeOperatorPassword = async (passwordData) => {
    await apiClient.post('/operator/profile/change-password', passwordData);
};


/**
 * Dohvata sve kategorije problema za prikaz u modalu.
 */
export const getProblemCategories = async () => {
    const response = await apiClient.get('/problem-categories');
    return response.data;
};

/**
 * Kreira novi support tiket.
 * @param {object} ticketData - Podaci za tiket { orderId, preselectedCategoryId, description }.
 */
export const createSupportTicket = async (ticketData) => {
    const response = await apiClient.post('/tickets', ticketData);
    return response.data;
};

export const getOperatorDashboard = async () => {
    const response = await apiClient.get('/operator/dashboard');
    return response.data;
};

export const getTicketDetails = async (ticketId) => {
    const response = await apiClient.get(`/tickets/${ticketId}`);
    return response.data;
};

export const markTicketAsResolved = async (ticketId) => {
    // Pretpostavljamo endpoint
    await apiClient.post(`/operator/tickets/${ticketId}/resolve`);
};

export const rateSupportTicket = async (ticketId, ratingData) => {
    await apiClient.post(`/tickets/${ticketId}/rate`, ratingData)
}

export const closeSupportTicket = async (ticketId) => {
    await apiClient.patch(`/tickets/${ticketId}/close`)
}

export const updateSupportAdminName = async (nameData) => {
    const response = await apiClient.patch('/support-admin/profile/name', nameData);
    return response.data;
}

export const updateOperatorName = async (nameData) => {
    // Novi PATCH zahtev na endpoint koji ste kreirali
    const response = await apiClient.patch('/operator/profile/name', nameData);
    return response.data;
};

export const deleteOperator = async (operatorId) => {
    await apiClient.delete(`/support-admin/operators/${operatorId}`);
};

export const downloadOperatorReport = async (operatorId, startDate = null, endDate = null) => {
  let url = `/support-admin/operators/${operatorId}/report`;
  
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await apiClient.get(url, { responseType: "blob" });
  return response.data;
};



// Funkcija za operatera (dohvata svoju istoriju) i admina (dohvata celu istoriju)
export const getTicketHistory = async () => {
  const response = await apiClient.get("/ticket-history");
  return response.data;
};

// Funkcija za admina (dohvata istoriju specifičnog operatera)
export const getOperatorTicketHistory = async (operatorId, startDate = null, endDate = null) => {
  let url = `/ticket-history/operator/${operatorId}`;
  
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await apiClient.get(url);
  return response.data;
};

export const getRestaurantAnalytics = async (restaurantId = null, startDate = null, endDate = null) => {
  if (restaurantId) {
    let url = `/restaurant-analytics/${restaurantId}`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } else {
  const response = await apiClient.get("/restaurant-analytics");
  return response.data;
  }
};

export const sendAnalyticsToManager = async (restaurantId, startDate = null, endDate = null) => {
  let url = `/restaurant-analytics/send-report/${restaurantId}`;
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (params.toString()) url += `?${params.toString()}`;
  
  const response = await apiClient.post(url);
  return response.data;
};

export const updateOperatorStatus = async (status) => {
  // Šaljemo status kao JSON objekat
  await apiClient.patch("/operator/profile/status", { status });
};