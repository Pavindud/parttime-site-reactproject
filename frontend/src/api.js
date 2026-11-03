const BASE = 'http://localhost/parttime-site/backend';

export async function registerUser(userData) {
  const response = await fetch(`${BASE}/auth/register.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(userData)
  });
  return response.json();
}

export async function loginUser(credentials) {
  const response = await fetch(`${BASE}/auth/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials)
  });
  return response.json();
}

export async function logoutUser() {
  const response = await fetch(`${BASE}/auth/logout.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  return response.json();
}

export async function getJobs(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const response = await fetch(`${BASE}/jobs/list.php${query}`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}

export async function getJob(id) {
  const response = await fetch(`${BASE}/jobs/get.php?id=${encodeURIComponent(id)}`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}

export async function createJob(jobData) {
  const response = await fetch(`${BASE}/jobs/create.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(jobData)
  });
  return response.json();
}

export async function getMyJobs() {
  const response = await fetch(`${BASE}/jobs/my_jobs.php`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}

export async function closeJob(job_id) {
  const response = await fetch(`${BASE}/jobs/close.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ job_id })
  });
  return response.json();
}

export async function applyToJob(job_id) {
  const response = await fetch(`${BASE}/applications/apply.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ job_id })
  });
  return response.json();
}

export async function getMyApplications() {
  const response = await fetch(`${BASE}/applications/my_applications.php`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}

export async function getApplicants(job_id) {
  const response = await fetch(`${BASE}/applications/applicants.php?job_id=${encodeURIComponent(job_id)}`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}

export async function updateApplicationStatus(application_id, status) {
  const response = await fetch(`${BASE}/applications/update_status.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ application_id, status })
  });
  return response.json();
}

export async function addRating(ratingData) {
  const response = await fetch(`${BASE}/ratings/add.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(ratingData)
  });
  return response.json();
}

export async function getRatings(user_id) {
  const response = await fetch(`${BASE}/ratings/get.php?user_id=${encodeURIComponent(user_id)}`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}
