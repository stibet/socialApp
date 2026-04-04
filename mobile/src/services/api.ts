import axios from 'axios';
import { useStore } from '../store';

export const BASE_URL = 'http://192.168.1.165:3000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export const authApi = {
  sendOtp: (phone: string) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone: string, otp: string, name?: string, gender?: string) =>
    api.post('/auth/verify-otp', { phone, otp, name, gender }),
};

export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: any) => api.put('/users/me', data),
  getUser: (id: string) => api.get(`/users/${id}`),
};

export const venuesApi = {
  getAll: (district?: string) => api.get('/venues', { params: district ? { district } : {} }),
  getOne: (id: string) => api.get(`/venues/${id}`),
};

export const eventsApi = {
  getUpcoming: (venueId?: string) => api.get('/events', { params: venueId ? { venueId } : {} }),
  getOne: (id: string) => api.get(`/events/${id}`),
};

export const groupsApi = {
  getByEvent: (eventId: string) => api.get(`/groups/event/${eventId}`),
  getMyGroups: () => api.get('/groups/my'),
  getOne: (id: string) => api.get(`/groups/${id}`),
  create: (data: any) => api.post('/groups', data),
  join: (id: string) => api.post(`/groups/${id}/join`),
  leave: (id: string) => api.delete(`/groups/${id}/leave`),
  close: (id: string) => api.delete(`/groups/${id}/close`),
};

export const reviewsApi = {
  create: (data: any) => api.post('/reviews', data),
  getByUser: (userId: string) => api.get(`/reviews/user/${userId}`),
};