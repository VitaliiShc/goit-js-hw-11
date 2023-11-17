import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { Notify } from 'notiflix/build/notiflix-notify-aio';

import { fetchImgs } from './js/fetchimgs.js';

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const notifyParams = {
  position: 'center-top',
  timeout: 2000,
  width: '500px',
  fontSize: '24px',
};

const per_page = 40;
let page = 1;
let wordQuery = '';

loadMoreBtn.classList.add('is-hidden');

searchForm.addEventListener('submit', onSearhBtnClick);

function onSearhBtnClick(e) {
  e.preventDefault();

  gallery.innerHTML = '';
  page = 1;
  const { searchQuery } = e.currentTarget.elements;
  wordQuery = searchQuery.value.trim().toLowerCase().split(' ').join('+');

  if (wordQuery === '') {
    Notify.warning('Enter your request, please!', notifyParams);
    return;
  }

  fetchImgs(wordQuery, page, per_page)
    .then(data => {
      const queryResult = data.hits;
      if (data.totalHits === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
          notifyParams
        );
      } else {
        Notify.success(`Hooray! We found ${data.totalHits} images.`, notifyParams);
        createMarkup(queryResult);
        lightbox.refresh();
      }
      if (data.totalHits > per_page) {
        loadMoreBtn.classList.remove('is-hidden');
        window.addEventListener('scroll', loadMoreImgs);
      }
      if (data.totalHits <= per_page && data.totalHits !== 0) {
        Notify.info(
          `We're sorry, but you've reached the end of search results`,
          notifyParams
        );
      }
    })
    .catch(onFetchError);

  loadMoreBtn.addEventListener('click', onClickLoadMore);

  e.currentTarget.reset();
}

function onClickLoadMore() {
  page += 1;
  fetchImgs(wordQuery, page, per_page)
    .then(data => {
      const queryResult = data.hits;
      const numberOfPage = Math.ceil(data.totalHits / per_page);

      createMarkup(queryResult);
      if (page === numberOfPage) {
        loadMoreBtn.classList.add('is-hidden');
        Notify.success(
          "We're sorry, but you've reached the end of search results.",
          notifyParams
        );
        loadMoreBtn.removeEventListener('click', onClickLoadMore);
        window.removeEventListener('scroll', loadMoreImgs);
      }
      lightbox.refresh();
    })
    .catch(onFetchError);
}

function onFetchError() {
  Notify.failure(
    'Oops! Something went wrong! Try reloading the page or make another choice!',
    notifyParams
  );
}

function loadMoreImgs() {
  if (checkIfEndOfPage()) {
    onClickLoadMore();
  }
}

function checkIfEndOfPage() {
  return (
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight
  );
}

function createMarkup(queryResult) {
  const galleryMarkup = queryResult
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
            <a class="img-link" href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" height="200" loading="lazy" />
            </a>
        <div class="info">
            <p class="info-item">
            <b>Likes:</b> ${likes}
            </p>
            <p class="info-item">
            <b>Views:</b> ${views}
            </p>
            <p class="info-item">
            <b>Comments:</b> ${comments}
            </p>
            <p class="info-item">
          <b>Downloads:</b> ${downloads}
            </p>
        </div>
        </div>`;
      }
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', galleryMarkup);
}

const lightbox = new SimpleLightbox('.img-link', {
  captionDelay: 250,
  captionsData: 'alt',
});
