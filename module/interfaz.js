export function displayBannerImage(imageData) {
    const bannerContainer = document.getElementById('banner');
    bannerContainer.innerHTML = `
        <div class="position-relative" style="height: 300px;">
            <img src="${imageData.hdurl || imageData.url}" alt="${imageData.title}" class="w-100 h-100 object-fit-cover">
            <div class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-between p-3" style="background: rgba(0,0,0,0.5);">
                <h1 class="display-4 text-white text-center">Bienvenido al Explorador de APOD de la NASA</h1>
                <div class="text-white">
                    <h3 class="h5 mb-1">${imageData.title}</h3>
                    <p class="mb-0 small">${imageData.date}</p>
                </div>
            </div>
        </div>
    `;
}

export function displayImages(images, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id "${containerId}" not found`);
        return;
    }
    
    container.innerHTML = '';
    addImages(images, containerId);
}

export function addImages(images, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id "${containerId}" not found`);
        return;
    }
    
    if (images.length === 0) {
        if (container.children.length === 0) {
            container.innerHTML = '<p class="alert alert-info">No se encontraron imágenes para los filtros seleccionados.</p>';
        }
        return;
    }
    
    images.forEach(image => {
        if (image.media_type === 'image' || image.media_type === 'video') {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
            colDiv.innerHTML = `
                <div class="card h-100">
                    <div class="card-img-container">
                        ${image.media_type === 'image' 
                            ? `<img src="${image.url}" class="card-img-top" alt="${image.title}">` 
                            : `<div class="embed-responsive embed-responsive-16by9">
                                 <iframe class="embed-responsive-item" src="${image.url}" allowfullscreen></iframe>
                               </div>`
                        }
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-truncate" title="${image.title}">${image.title}</h5>
                        <p class="card-text"><small class="text-muted">${image.date}</small></p>
                        <div class="mt-auto">
                            <button class="btn btn-primary btn-sm" onclick="showDetails('${image.date}')">View details</button>
                            <button class="btn btn-outline-warning btn-sm favorite-btn" onclick="toggleFavorite('${image.date}')" data-date="${image.date}">
                                <i class="far fa-star"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(colDiv);
        }
    });
    
    if (typeof window.updateFavoriteButtons === 'function') {
        window.updateFavoriteButtons();
    }
}

export function showImageDetails(image) {
    const detailsHTML = `
    <div class="container mt-5">
        <div class="row">
            <div class="col-lg-8 offset-lg-2">
                <div class="card image-details-card">
                    <div class="card-header">
                        <h2 class="mb-0">${image.title}</h2>
                    </div>
                    <div class="card-body">
                        ${image.media_type === 'image' 
                            ? `<img src="${image.hdurl || image.url}" alt="${image.title}" class="img-fluid rounded mb-4">`
                            : `<div class="embed-responsive embed-responsive-16by9 mb-4">
                                <iframe class="embed-responsive-item" src="${image.url}" allowfullscreen></iframe>
                               </div>`
                        }
                        <p class="lead">${image.explanation}</p>
                        <div class="d-flex justify-content-between align-items-center mt-4">
                            <span class="text-muted"><i class="fas fa-calendar-alt"></i> ${image.date}</span>
                            <span class="text-muted"><i class="fas fa-copyright"></i> ${image.copyright || 'NASA'}</span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary" onclick="location.reload()">
                            <i class="fas fa-arrow-left"></i> Back to
                        </button>
                        ${image.hdurl ? `
                            <a href="${image.hdurl}" class="btn btn-secondary float-right" target="_blank">
                                <i class="fas fa-download"></i> Download HD
                            </a>
                        ` : ''}
                        <button class="btn btn-outline-warning favorite-btn" onclick="toggleFavorite('${image.date}')" data-date="${image.date}">
                            <i class="far fa-star"></i> favorite
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.innerHTML = detailsHTML;
    
    // Actualizar el botón de favorito en la vista de detalles
    if (typeof window.updateFavoriteButtons === 'function') {
        window.updateFavoriteButtons();
    }
}

export function showLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (!loadingIndicator) {
        const indicator = document.createElement('div');
        indicator.id = 'loading-indicator';
        indicator.innerHTML = '<p class="text-center">Cargando más imágenes...</p>';
        document.body.appendChild(indicator);
    } else {
        loadingIndicator.style.display = 'block';
    }
}

export function hideLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}