const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request(path: string, options: RequestInit = {}) {
    const url = `${BACKEND_URL}/api${path}`;
    const headers: any = { 'Content-Type': 'application/json', ...options.headers };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Request failed');
    return data;
  }

  // Auth
  register(body: { name: string; email: string; phone: string; password: string; address?: string }) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
  }
  login(body: { email: string; password: string }) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
  }
  getMe() {
    return this.request('/auth/me');
  }
  updateProfile(body: any) {
    return this.request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) });
  }

  // Menu
  getMenu(day?: string) {
    return this.request(`/menu${day ? `?day=${day}` : ''}`);
  }
  getWeeklyMenu() {
    return this.request('/menu/weekly');
  }
  createMenuItem(body: any) {
    return this.request('/menu', { method: 'POST', body: JSON.stringify(body) });
  }
  updateMenuItem(id: string, body: any) {
    return this.request(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }
  deleteMenuItem(id: string) {
    return this.request(`/menu/${id}`, { method: 'DELETE' });
  }

  // Plans
  getPlans() {
    return this.request('/plans');
  }
  createPlan(body: any) {
    return this.request('/plans', { method: 'POST', body: JSON.stringify(body) });
  }

  // Orders
  createOrder(body: any) {
    return this.request('/orders', { method: 'POST', body: JSON.stringify(body) });
  }
  getOrders() {
    return this.request('/orders');
  }
  getAllOrders(status?: string) {
    return this.request(`/orders/all${status ? `?status=${status}` : ''}`);
  }
  getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }
  updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  }

  // Subscriptions
  createSubscription(planId: string) {
    return this.request('/subscriptions', { method: 'POST', body: JSON.stringify({ plan_id: planId }) });
  }
  getSubscriptions() {
    return this.request('/subscriptions');
  }
  getAllSubscriptions() {
    return this.request('/subscriptions/all');
  }

  // Admin
  getDashboard() {
    return this.request('/admin/dashboard');
  }
  getCustomers() {
    return this.request('/admin/customers');
  }

  // Payment
  mockPayment(amount: number, orderId?: string) {
    return this.request('/payment/mock', { method: 'POST', body: JSON.stringify({ amount, order_id: orderId }) });
  }

  // Seed
  seed() {
    return this.request('/seed', { method: 'POST' });
  }
}

export const api = new ApiClient();
