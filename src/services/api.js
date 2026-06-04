export const BASE_URL = 'https://airwatch-api.onrender.com';

let _token = null;
export const setAuthToken = (t) => { _token = t; };
export const clearAuthToken = () => { _token = null; };

const req = async (method, path, body = null) => {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${BASE_URL}/${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const e = await res.json(); msg = e.message ?? e.error ?? msg; } catch (_) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
};

// Paginação — extrai array do campo 'content' do Page do Spring
const page = async (method, path, body = null) => {
  const data = await req(method, path, body);
  return Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
const extractLoginResponse = (data) => {
  const token = data?.token ?? data?.accessToken ?? data?.access_token ?? null;
  const email = data?.email ?? data?.username ?? null;
  const role  = data?.role  ?? data?.roles?.[0] ?? null;
  if (!token) throw new Error('Token não encontrado na resposta do servidor');
  return { token, email, role };
};

export const authService = {
  register: (data) => req('POST', 'api/auth/register', data),
  login: async (data) => {
    const res = await req('POST', 'api/auth/login', data);
    return extractLoginResponse(res);
  },
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const userService = {
  getAll:  ()         => page('GET', 'api/users?size=100'),
  getById: (id)       => req('GET',  `api/users/${id}`),
  update:  (id, data) => req('PUT',  `api/users/${id}`, data),
  delete:  (id)       => req('DELETE',`api/users/${id}`),
};

// ─── Countries ────────────────────────────────────────────────────────────────
export const countryService = {
  getAll:  ()         => page('GET',   'api/countries?size=100'),
  getById: (id)       => req('GET',    `api/countries/${id}`),
  create:  (data)     => req('POST',   'api/countries', data),
  update:  (id, data) => req('PUT',    `api/countries/${id}`, data),
  delete:  (id)       => req('DELETE', `api/countries/${id}`),
};

// ─── Cities ───────────────────────────────────────────────────────────────────
export const cityService = {
  getAll:         ()         => page('GET',   'api/cities?size=100'),
  getById:        (id)       => req('GET',    `api/cities/${id}`),
  getByCountry:   (cid)      => page('GET',   `api/cities/country/${cid}?size=100`),
  create:         (data)     => req('POST',   'api/cities', data),
  update:         (id, data) => req('PUT',    `api/cities/${id}`, data),
  delete:         (id)       => req('DELETE', `api/cities/${id}`),
};

// ─── Sensors ──────────────────────────────────────────────────────────────────
export const sensorService = {
  getAll:      ()         => page('GET',   'api/sensors?size=100'),
  getById:     (id)       => req('GET',    `api/sensors/${id}`),
  getByCity:   (cityId)   => page('GET',   `api/sensors/city/${cityId}?size=100`),
  create:      (data)     => req('POST',   'api/sensors', data),
  update:      (id, data) => req('PUT',    `api/sensors/${id}`, data),
  delete:      (id)       => req('DELETE', `api/sensors/${id}`),
};

// ─── Air Readings ─────────────────────────────────────────────────────────────
export const airReadingService = {
  getAll:    ()         => page('GET',   'api/air-readings?size=50'),
  getById:   (id)       => req('GET',    `api/air-readings/${id}`),
  getByCity: (cityId)   => page('GET',   `api/air-readings/city/${cityId}?size=20&sort=readingAt,desc`),
  create:    (data)     => req('POST',   'api/air-readings', data),
  delete:    (id)       => req('DELETE', `api/air-readings/${id}`),
};

// ─── Alert Configs ────────────────────────────────────────────────────────────
export const alertConfigService = {
  getAll:      ()         => page('GET',   'api/alert-configs?size=100'),
  getById:     (id)       => req('GET',    `api/alert-configs/${id}`),
  getByUser:   (userId)   => page('GET',   `api/alert-configs/user/${userId}?size=100`),
  getByCity:   (cityId)   => page('GET',   `api/alert-configs/city/${cityId}?size=100`),
  create:      (data)     => req('POST',   'api/alert-configs', data),
  update:      (id, data) => req('PUT',    `api/alert-configs/${id}`, data),
  toggle:      (id)       => req('PATCH',  `api/alert-configs/${id}/toggle`),
  delete:      (id)       => req('DELETE', `api/alert-configs/${id}`),
};

// ─── Alert Events ─────────────────────────────────────────────────────────────
export const alertEventService = {
  getAll:       ()       => page('GET',  'api/alert-events?size=50'),
  getById:      (id)     => req('GET',   `api/alert-events/${id}`),
  getByCity:    (cityId) => page('GET',  `api/alert-events/city/${cityId}?size=50`),
  getByUser:    (userId) => page('GET',  `api/alert-events/user/${userId}?size=50`),
  getByStatus:  (status) => page('GET',  `api/alert-events/status/${status}?size=50`),
  create:       (data)   => req('POST',  'api/alert-events', data),
  markAsSent:   (id)     => req('PATCH', `api/alert-events/${id}/send`),
  markAsIgnored:(id)     => req('PATCH', `api/alert-events/${id}/ignore`),
  delete:       (id)     => req('DELETE',`api/alert-events/${id}`),
};

// ─── OpenAQ (externa) ─────────────────────────────────────────────────────────
export const openAQService = {
  fetchByCity: async (cityName) => {
    const url = `https://api.openaq.org/v3/locations?limit=3&country_id=BR&city=${encodeURIComponent(cityName)}`;
    const res  = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('OpenAQ indisponível');
    const data = await res.json();
    return data.results ?? [];
  },
};
