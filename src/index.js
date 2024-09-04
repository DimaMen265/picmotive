import axios from "axios";
import Notiflix from "notiflix";

import simpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const form = document.querySelector('#search-form');
const searchInput = document.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');

const pagination = document.querySelector(".pagination");
pagination.classList.add("visually-hidden");

const prev = document.querySelector('.prev');

const next = document.querySelector('.next');

const doublePrev = document.querySelector('.double-prev');

const doubleNext = document.querySelector('.double-next');

const buttonsNumbers = document.querySelector('.buttons-numbers');

const backToTop = document.querySelector('.back-to-top');
backToTop.hidden = true;

let countPage = 40;
let page = 1;
let maxPages = page;

const optionsGallery = {
    sourceAttr: "href",
    captions: true,
    captionsData: "alt",
    captionPosition: "bottom",
    captionDelay: 250,
    disableScroll: false,
    scrollZoom: false,
    doubleTapZoom: false,
};

const lightbox = new simpleLightbox(".gallery a", optionsGallery);

const getImages = async () => {

    const paramsObject = {
        key: "40222608-3820d97c8748fab8cb367624f",
        q: searchInput.value.trim(),
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        per_page: countPage,
        page: page,
    };

    const params = new URLSearchParams(paramsObject);

    try {
        const response = await axios.get(`https://pixabay.com/api/?${params}`);
        return response;
    } catch (error) {
        getError(error);
    }
};

form.addEventListener("submit", event => {
    event.preventDefault();

    removeChildren(gallery);

    page = 1;

    if (searchInput.value.trim().length === 0) {
        Notiflix.Notify.failure("The search field must be filled!");
        return;
    };

    if (next.disabled || doubleNext.disabled) {
        next.disabled = false;
        doubleNext.disabled = false;
    };

    getImages()
        .then(response => render(response.data))
        .catch(error => getError(error));
});

const render = items => {
    maxPages = Math.ceil(items.totalHits / countPage);

    if (items.hits.length === 0) {
        return getError(error);
    };

    Notiflix.Notify.success(`Hooray! We found ${items.totalHits} images.`);

    if (items.totalHits > 0) {
        const markup = items.hits
            .map(item => {
                return `<a class="photo-card" href="${item.largeImageURL}">
                <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
                <div class="info">
                <p class="info-item">
                <b>Likes</b>
                ${item.likes}
                </p>
                <p class="info-item">
                <b>Views</b>
                ${item.views}
                </p>
                <p class="info-item">
                <b>Comments</b>
                ${item.comments}
                </p>
                <p class="info-item">
                <b>Downloads</b>
                ${item.downloads}
                </p>
                </div>
                </a>`;
            }).join("");

        gallery.insertAdjacentHTML("beforeend", markup);

        lightbox.refresh();

        renderButtons(items);
    };

    if (items.totalHits <= countPage) {
        pagination.classList.add("visually-hidden");
    } else {
        pagination.classList.remove("visually-hidden");
    };

    if (maxPages <= 2) {
        doublePrev.classList.add("visually-hidden");
        doubleNext.classList.add("visually-hidden");
    } else {
        doublePrev.classList.remove("visually-hidden");
        doubleNext.classList.remove("visually-hidden");
    };
};

const removeChildren = container => {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    };
};

const getError = error => {
    error = Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");

    pagination.classList.add("visually-hidden")
};

const renderButtons = bth => {
    maxPages = Math.ceil(bth.totalHits / countPage);

    let arrBth = [];

    for (let i = 0; i < maxPages; i += 1) {
        arrBth.push(i + 1);
    };

    buttonsNumbers.innerHTML = "";

    arrBth.forEach(bthNum => {
        const button = document.createElement("button");
        button.classList.add("bth-num");
        button.classList.add("visually-hidden");
        button.textContent = bthNum;

        buttonsNumbers.appendChild(button);

        button.addEventListener("click", () => {
            page = bthNum;

            removeChildren(gallery);

            getImages()
                .then(response => render(response.data))
                .catch(error => getError(error));
            
            lightbox.refresh();

            if (page === 1) {
                Notiflix.Notify.info("You're at the beginning of the search results.");

                prev.disabled = true;
                doublePrev.disabled = true;
            } else {
                prev.disabled = false;
                doublePrev.disabled = false;
            };

            if (page === maxPages) {
                Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");

                next.disabled = true;
                doubleNext.disabled = true;
            } else {
                next.disabled = false;
                doubleNext.disabled = false;
            };
            
            updateActiveClass();
            updateButtonsVisibility();
        });
    });

    updateActiveClass();
    updateButtonsVisibility();
};

const updateActiveClass = () => {
    const allButtons = document.querySelectorAll('.bth-num');

    allButtons.forEach((button, index) => {
        const isActivePage = index + 1 === page;
        if (isActivePage) {
            button.classList.add("active");
            button.disabled = true;
        } else {
            button.classList.remove("active");
            button.disabled = false;
        };
    });
};

const updateButtonsVisibility = () => {
    const allButtons = document.querySelectorAll('.bth-num');
    
    allButtons.forEach((button, index) => {
        if (page === 1) {
            if (index + 1 <= 3) {
                button.classList.remove("visually-hidden");
            } else {
                button.classList.add("visually-hidden");
            };
        } else if (page === maxPages) {
            if (index + 1 > maxPages - 3) {
                button.classList.remove("visually-hidden");
            } else {
                button.classList.add("visually-hidden");
            };
        } else {
            if (index + 1 === page || index + 2 === page || index === page) {
                button.classList.remove("visually-hidden");
            } else {
                button.classList.add("visually-hidden");
            };
        };
    });
};

prev.addEventListener("click", () => {
    if (page > 1) {
        page -= 1;

        removeChildren(gallery);

        getImages()
            .then(response => render(response.data))
            .catch(error => getError(error));

        lightbox.refresh();
    };

    if (page === 1) {
        Notiflix.Notify.info("You're at the beginning of the search results.");
        
        prev.disabled = true;
        doublePrev.disabled = true;
    };

    next.disabled = false;
    doubleNext.disabled = false;
});

next.addEventListener("click", () => {
    if (maxPages > page) {
        page += 1;

        removeChildren(gallery);

        getImages()
            .then(response => render(response.data))
            .catch(error => getError(error));
        
        lightbox.refresh();
    }

    if (page === maxPages) {
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");

        next.disabled = true;
        doubleNext.disabled = true;
    };
    
    prev.disabled = false;
    doublePrev.disabled = false;
});

doublePrev.addEventListener("click", () => {
    page = 1;

    removeChildren(gallery);

    getImages()
        .then(response => render(response.data))
        .catch(error => getError(error));

    lightbox.refresh();

    Notiflix.Notify.info("You're at the beginning of the search results.");

    prev.disabled = true;
    next.disabled = false;

    doublePrev.disabled = true;
    doubleNext.disabled = false;
});

doubleNext.addEventListener("click", () => {
    page = maxPages;

    removeChildren(gallery);

    getImages()
        .then(response => render(response.data))
        .catch(error => getError(error));

    lightbox.refresh();

    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");

    next.disabled = true;
    doubleNext.disabled = true;
    
    prev.disabled = false;
    doublePrev.disabled = false;
});

(() => {
    window.addEventListener("scroll", () => {
        if (window.scrollY > window.innerHeight) {
            backToTop.hidden = false;
        } else {
            backToTop.hidden = true;
        };
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });
})();
