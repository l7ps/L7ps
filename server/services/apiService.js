const axios = require('axios');

class ApiService {
  constructor() {
    this.baseURL = process.env.API_BASE_URL;
    this.email = process.env.API_EMAIL;
    this.password = process.env.API_PASSWORD;
    this.token = null;
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.email,
        password: this.password
      });
      
      this.token = response.data.token;
      return this.token;
    } catch (error) {
      console.error('Erro na autenticação:', error.response?.data || error.message);
      throw new Error('Falha na autenticação com a API');
    }
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expirado, tentar reautenticar
        await this.authenticate();
        return this.makeRequest(endpoint, method, data);
      }
      throw error;
    }
  }

  async getPartners(page = 1, limit = 100) {
    return this.makeRequest(`/partners?page=${page}&limit=${limit}`);
  }

  async getAllPartners() {
    let allPartners = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getPartners(page, 100);
      allPartners = allPartners.concat(response.data || response);
      
      if (response.data && response.data.length < 100) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allPartners;
  }

  async getPartnerDetails(partnerId) {
    return this.makeRequest(`/partners/${partnerId}`);
  }

  async getPartnerServices(partnerId) {
    return this.makeRequest(`/partners/${partnerId}/services`);
  }

  async getPartnerSchedules(partnerId) {
    return this.makeRequest(`/partners/${partnerId}/schedules`);
  }
}

module.exports = new ApiService();