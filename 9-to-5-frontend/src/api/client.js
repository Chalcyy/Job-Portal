const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('token');
  const requestHeaders = { ...headers };

  if (body && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: requestHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const jobsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/jobs${query ? `?${query}` : ''}`);
  },
  suggestions: (q) => apiRequest(`/jobs/suggestions?q=${encodeURIComponent(q)}`),
  get: (id) => apiRequest(`/jobs/${id}`),
  recommended: () => apiRequest('/jobs/recommended'),
  companyJobs: () => apiRequest('/jobs/company/mine'),
  create: (data) => apiRequest('/jobs', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/jobs/${id}`, { method: 'PUT', body: data }),
  remove: (id) => apiRequest(`/jobs/${id}`, { method: 'DELETE' }),
};

export const candidatesApi = {
  register: (data) => apiRequest('/candidates/register', { method: 'POST', body: data }),
  login: (data) => apiRequest('/candidates/login', { method: 'POST', body: data }),
  profile: () => apiRequest('/candidates/profile'),
  updateProfile: (data) => apiRequest('/candidates/profile', { method: 'PUT', body: data }),
  updateProfileWithResume: (formData) =>
    apiRequest('/candidates/profile', { method: 'PUT', body: formData }),
};

export const companiesApi = {
  register: (data) => apiRequest('/companies/register', { method: 'POST', body: data }),
  login: (data) => apiRequest('/companies/login', { method: 'POST', body: data }),
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/companies${query ? `?${query}` : ''}`);
  },
  get: (id) => apiRequest(`/companies/${id}`),
  profile: () => apiRequest('/companies/profile/me'),
  updateProfile: (data) => apiRequest('/companies/profile/me', { method: 'PUT', body: data }),
};

export const applicationsApi = {
  mine: () => apiRequest('/applications/mine'),
  apply: (jobId, formData) =>
    apiRequest(`/applications/${jobId}`, { method: 'POST', body: formData }),
  withdraw: (id) => apiRequest(`/applications/${id}/withdraw`, { method: 'DELETE' }),
  forJob: (jobId) => apiRequest(`/applications/job/${jobId}`),
  updateStatus: (id, status) =>
    apiRequest(`/applications/${id}/status`, { method: 'PATCH', body: { status } }),
};

export const chatApi = {
  send: (message, sessionId) =>
    apiRequest('/chat/message', {
      method: 'POST',
      body: { message, sessionId },
    }),
  upload: (formData) =>
    apiRequest('/chat/upload', {
      method: 'POST',
      body: formData,
    }),
  history: (sessionId) => apiRequest(`/chat/history/${sessionId}`),
  clear: (sessionId) =>
    apiRequest(`/chat/history/${sessionId}`, { method: 'DELETE' }),
  status: () => apiRequest('/chat/status'),
};
