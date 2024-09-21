import { fetchImageForDate, fetchImagesBetweenDates } from './peticiones.js';
import { displayImages, addImages, showImageDetails } from './interfaz.js';

// Variables globales
const allImages = [];
// let currentPage = 1;
// const imagesPerPage = 20;
let isLoading = false;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let lastLoadedDate = new Date();

const debounce = (func, delay) => {
    let debounceTimer;
    return (...args) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func(...args), delay);
    };
};

async function loadMoreImages() {
    if (isLoading) return;
    
    isLoading = true;
    document.querySelector('#loading-indicator').style.display = 'block';
    document.querySelector('#load-more-btn').disabled = true;

    const endDate = new Date(lastLoadedDate);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);

    try {
        const newImages = await fetchImagesBetweenDates(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        );

        allImages.push(...newImages);
        lastLoadedDate = startDate;

        applyFilters();

        document.querySelector('#load-more-btn').style.display = 
            startDate > new Date('1995-06-16') ? 'block' : 'none';
    } catch (error) {
        console.error('Error loading images:', error);
    } finally {
        isLoading = false;
        document.querySelector('#loading-indicator').style.display = 'none';
        document.querySelector('#load-more-btn').disabled = false;
    }
}

function applyFilters() {
    const mediaType = document.querySelector('#media-type').value;
    const dateRange = document.querySelector('#date-range').value;
    const keyword = document.querySelector('#keyword').value.toLowerCase().trim();

    let filteredImages = allImages;

    if (mediaType !== 'all') {
        filteredImages = filteredImages.filter(image => image.media_type === mediaType);
    }

    if (dateRange !== 'all') {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
        filteredImages = filteredImages.filter(image => new Date(image.date) >= cutoffDate);
    }

    if (keyword) {
        filteredImages = filteredImages.filter(image => 
            image.title.toLowerCase().includes(keyword) || 
            (image.explanation && image.explanation.toLowerCase().includes(keyword))
        );
    }

    displayImages(filteredImages, 'image-list');
    updateFavoriteButtons();
}

function toggleFavorite(date) {
    const index = favorites.indexOf(date);
    if (index === -1) {
        favorites.push(date);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButtons();
    if (document.querySelector('#favorites-modal').style.display === 'block') {
        showFavorites();
    }
}

function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const date = btn.getAttribute('data-date');
        const icon = btn.querySelector('i');
        icon.classList.toggle('far', !favorites.includes(date));
        icon.classList.toggle('fas', favorites.includes(date));
    });
}

async function showFavorites() {
    const modal = document.querySelector('#favorites-modal');
    const content = document.querySelector('#favorites-content');
    content.innerHTML = '<span class="close">&times;</span><h2>My Favorites</h2>';
    
    if (favorites.length === 0) {
        content.innerHTML += '<p>You have no saved favorites.</p>';
    } else {
        const favoritesContainer = document.createElement('div');
        favoritesContainer.className = 'favorites-container row';
        for (const date of favorites) {
            const image = await fetchImageForDate(date);
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item col-sm-6 col-md-4 col-lg-3 mb-3';
            favoriteItem.innerHTML = `
                <div class="card h-100">
                    <img src="${image.url}" class="card-img-top" alt="${image.title}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${image.title}</h5>
                        <p class="card-text"><small class="text-muted">${image.date}</small></p>
                        <button class="btn btn-primary btn-sm" onclick="window.showDetails('${date}')">Ver detalles</button>
                        <button class="btn btn-outline-warning btn-sm favorite-btn" onclick="window.toggleFavorite('${date}')" data-date="${date}">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                </div>
            `;
            favoritesContainer.appendChild(favoriteItem);
        }
        content.appendChild(favoritesContainer);
    }
    
    modal.style.display = 'block';
}

function handleBackToTop() {
    const backToTopButton = document.querySelector('#back-to-top');
    
    window.addEventListener('scroll', () => {
        backToTopButton.style.display = window.pageYOffset > 300 ? 'block' : 'none';
    });

    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initializeApp() {
    loadMoreImages();
    const debouncedApplyFilters = debounce(applyFilters, 300);

    document.querySelector('#media-type').addEventListener('change', debouncedApplyFilters);
    document.querySelector('#date-range').addEventListener('change', () => {
        const dateRange = document.querySelector('#date-range').value;
        document.querySelector('#load-more-btn').style.display = dateRange === 'all' ? 'block' : 'none';
        debouncedApplyFilters();
    });
    document.querySelector('#keyword').addEventListener('input', debouncedApplyFilters);
    document.querySelector('#show-favorites').addEventListener('click', showFavorites);
    document.querySelector('#load-more-btn').addEventListener('click', loadMoreImages);

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('close')) {
            document.querySelector('#favorites-modal').style.display = 'none';
        }
    });

    window.addEventListener('click', (event) => {
        const modal = document.querySelector('#favorites-modal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    handleBackToTop();
}

initializeApp();

window.showDetails = async (date) => {
    try {
        const image = await fetchImageForDate(date);
        showImageDetails(image);
    } catch (error) {
        console.error('Error showing image details:', error);
    }
};

window.toggleFavorite = toggleFavorite;
window.showFavorites = showFavorites;