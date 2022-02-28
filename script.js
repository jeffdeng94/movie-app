const API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=690d49b865b2db27de494cb0d51a7a8e&page=1'
const MOVIE_URL = 'https://api.themoviedb.org/3/movie/movie-id?api_key=690d49b865b2db27de494cb0d51a7a8e&language=en-US'
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280'
const SEARCH_API = 'https://api.themoviedb.org/3/search/movie?api_key=690d49b865b2db27de494cb0d51a7a8e&query="'
const VIDEO_URL = 'https://api.themoviedb.org/3/movie/videoID/videos?api_key=690d49b865b2db27de494cb0d51a7a8e'
const TRAILER_URL = 'https://www.youtube.com/embed/'

//logo div DOM
const logo = document.querySelector('.logo')

//movie card container DOM
const movieContainer = document.querySelector('.container')

//search function DOM
const form = document.querySelector('#form')
const searchEl = document.querySelector('.search')
const searchBtn = document.querySelector('#form i')

//page DOM
const pages = document.querySelectorAll('.page')

//movie trailer DOM
const videoContainer = document.querySelector('.video-container')
const video = document.querySelector('.video-container iframe')
const closeBtn = document.querySelector('.video-container i')
const noTrailer = document.querySelector('.no-trailer')

//get movies fetch data from the API URL, result is an Array of 20 objects
const getMovies = async url => {
  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.results.length === 0) {
      errorMessage(movieContainer, 'No Valid Data')
    } else {
      showMovies(data.results)
    }
  } catch (error) {
    errorMessage(movieContainer, error)
  }
}

//error message function
const errorMessage = (containerEl, error) => {
  containerEl.innerHTML = ''
  const errorEl = document.createElement('div')
  errorEl.classList.add('error-message')
  errorEl.innerHTML = `
    <p>Oops, something went wrong, please try again later</p>
    <span>Message: ${error}</span>
  `
  containerEl.appendChild(errorEl)
}

getMovies(API_URL)

//show movies
const showMovies = movies => {
  movieContainer.innerHTML = ''
  movies.forEach(movie => {
    //create movieCard div element
    const movieCard = document.createElement('div')
    movieCard.classList.add('movie-card')

    //create loading spinner element and insert inside movie card
    movieCard.innerHTML = ''
    movieCard.innerHTML = `<div class="loader">Loading...</div>`
    movieContainer.appendChild(movieCard)

    //fetch each movie detail by movie-id then insert inside movie card
    fetch(MOVIE_URL.replace('movie-id', movie.id))
      .then(response => response.json())
      .then(data => {
        const { title, id, overview, poster_path, vote_average } = data
        //check if img link is valid
        let imgPath
        if (poster_path !== null) {
          imgPath = IMG_PATH + poster_path
        } else {
          imgPath = 'https://themoviescatalogue-app-vercel.vercel.app/assets/img/comingsoon.jpg'
        }

        movieCard.innerHTML = ''
        movieCard.innerHTML = `
          <div class="img-container">
          <img
            src="${imgPath}"
            alt="${title}"
            class="movie-img"
          />
          <div class="overview">
            <h3>Overview</h3>
            <p>
              ${overview}
            </p>
          </div>
          <div class="play" id="${id}">
          <i class="fa-regular fa-circle-play"></i>
          <span style="display:none">${id}</span>
        </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${title}</h3>
          <span class="movie-rating ${getClassByRate(vote_average)}">${vote_average}</span>
        </div>
    
          `
        movieContainer.appendChild(movieCard)
      })
      .catch(error => {
        movieCard.innerHTML = ''
        errorMessage(movieCard, error)
      })
  })
}

//get trailer videos by movie id
const getVideos = async id => {
  url = VIDEO_URL.replace('videoID', id.toString())
  try {
    const res = await fetch(url)
    const data = await res.json()
    const trailerKey = data.results
      .map(result => {
        if (result.name === 'Official Trailer') {
          return result.key
        }
      })
      .filter(key => key)[0]
    if (trailerKey) {
      let videoSrc = TRAILER_URL + trailerKey
      video.src = videoSrc
    } else {
      video.src = ''
      noTrailer.classList.add('show')
    }
  } catch (error) {
    video.src = ''
    noTrailer.classList.add('show')
    console.log(error)
  }
}

//add event listener to each play button using event delegation
movieContainer.addEventListener('click', e => {
  const id = e.target.parentElement.id
  if (id) {
    videoContainer.classList.remove('closed')
    getVideos(id)
  }
})

//add event listener to close button
closeBtn.addEventListener('click', () => {
  video.src = ''
  videoContainer.classList.add('closed')
  noTrailer.classList.remove('show')
})

//get class by rate
const getClassByRate = vote => {
  if (vote >= 8) {
    return 'lightgreen'
  } else if (vote >= 5) {
    return 'orange'
  } else {
    return 'red'
  }
}

//search function
const search = event => {
  event.preventDefault()
  const searchText = searchEl.value
  if (searchText && searchText !== '') {
    getMovies(SEARCH_API + searchText)
    searchEl.value = ''
  } else {
    window.location.reload()
  }
}

form.addEventListener('submit', e => search(e))
searchBtn.addEventListener('click', e => search(e))

//page button function
let currentPage = 1
pages.forEach((page, targetPage) => {
  page.addEventListener('click', () => {
    updatePage(targetPage)
    highlightPage()
  })
})

const updatePage = targetPage => {
  targetPage = targetPage + 1
  if (targetPage === currentPage) {
    window.location.reload()
  } else {
    const TARGET_URL = API_URL.replace('page=1', 'page=') + `${targetPage}`
    getMovies(TARGET_URL)
    currentPage = targetPage
  }
}

const highlightPage = () => {
  pages.forEach((page, index) => {
    page.classList.remove('clicked')
    if (index + 1 === currentPage) {
      page.classList.add('clicked')
    }
  })
}

//scroll button DOM
const scrollTopBtn = document.querySelector('.top')

const scrollFunction = () => {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollTopBtn.style.display = 'block'
  } else {
    scrollTopBtn.style.display = 'none'
  }
}

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction()
}

const topFunction = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
// When the user clicks on the button, scroll to the top of the document
scrollTopBtn.addEventListener('click', topFunction)

logo.addEventListener('click', () => window.location.reload())
