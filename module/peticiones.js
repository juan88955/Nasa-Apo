import { API_KEY, API_URL } from './config.js';

export async function fetchImageForDate(date) {
    const response = await fetch(`${API_URL}?api_key=${API_KEY}&date=${date}`);
    return response.json();
}

export async function fetchImagesBetweenDates(startDate, endDate) {
    const response = await fetch(`${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
}
