// console.log('hola mundo!');
// const noCambia = "Leonidas";

// let cambia = "@LeonidasEsteban"

// function cambiarNombre(nuevoNombre) {
//   cambia = nuevoNombre
// }

// const getUserAll = new Promise(function(todoBien, todoMal) {
//   //lamar a un API
//   setTimeout(function(){
//     todoBien('se acabo el tiempo')
//   }, 5000)
// })

// const getUser = new Promise(function(todoBien, todoMal) {
//   //lamar a un API
//   setTimeout(function(){
//     todoBien('se acabo el tiempo')
//   }, 3000)
// })

// // getUser
// //   .then(function () {
// //     console.log('Todo esta bien en la vida')
// //   })
// //   .catch(function(message) {
// //     console.log(message)
// //   })

//   Promise.all([
//     getUser,
//     getUserAll
//   ])
//   .then(function(message) {
//     console.log(message)
//   })
//   .catch(function(message) {
//     console.log(message)
//   })





//   $.ajax('https://randomuser.me/api/', {
//     method: 'GET',
//     succes: function(data) {
//       console.log(data)
//     },
//     error: function(error) {
//       console.log(error)
//     }
//   })

//   fetch('https://randomuser.me/api/')
//     .then(function(response) {
//       console.log(response)
//       return response.json()
//     })
//     .then(function(userData) {
//       console.log('user: ', userData.results[0].name.first)
//     })
//     .catch(function() {
//       console.log('algo fallo')
//     });


(async function load(){
  const BASE_API = 'https://yts.mx/api/v2/';

  async function getData(url){
    const response = await fetch(url);
    const data = await response.json();
      if( data.data && data.data.movie_count) {
        return data
      }else if( data.results) {
        return data
      }
      throw new Error("don't found any results");
  }

  const $form = document.getElementById('form');
  const $home = document.getElementById('home');
  const $featuringContainer = document.getElementById('featuring');

  function setAttributes($element, attributes) {
    for(const attribute in attributes){
      $element.setAttribute( attribute, attributes[attribute])
    }
  } 

  function featuringTemplate(movie){
    return (
      `<div class="featuring">
        <div class="featuring-image">
          <img src="${movie.medium_cover_image}" width="70" height="100" alt="">
        </div>
          <div class="featuring-content">
            <p class="featuring-title">Pelicula encontrada</p>
            <p class="featuring-album">${movie.title}</p>
          </div>
        </div>`
    )
  }

  function userTemplate(user){
    return(
      ` <li class="playlistFriends-item" data-uuid=${user.login.uuid}>
         <a href="#">
           <img src="${user.picture.thumbnail}" alt="user picture" />
           <span>
             ${user.login.username}
           </span>
         </a>
       </li>`
    )
  }

  $form.addEventListener('submit', async (event) => {
    event.preventDefault();
    $home.classList.add('search-active');
    $loader = document.createElement('img');
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50,
    })
    $featuringContainer.append($loader);
    
    const data = new FormData($form);
    try {
      const {
        data: {
          movies
        }
      } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`)
      
      const HTMLString = featuringTemplate(movies[0]);
      $featuringContainer.innerHTML = HTMLString;
    }catch(error){
      alert(error.message);
      $loader.remove();
      $home.classList.remove('search-active');

    }
  })

  function videoItemTemplate(movie, category){
    return(
      `<div class="primaryPlaylistItem" data-id=${movie.id} data-category=${category}>
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title}    
        </h4>
      </div>`
    )
  }

  function userDescriptionTemplate(user) {
      return(
        `<ul class="userDescriptionTemplate"> 
          <li id='userModalName'><span class="userModalField">name</span> : <span>${user.name.first} ${user.name.last}</span></li>
          <li id='userModalAge'><span class="userModalField">age</span> : <span>${user.dob.age}</span></li>
          <li id='userModalGender'><span class="userModalField">gender</span> : <span>${user.gender}</span></li>
          <li id='userModalEmail'><span class="userModalField">Email</span> : <span>${user.email}</span></li>
          <li id='userModalCity'><span class="userModalField">location</span> : <span>${user.location.city}</span></li>
          <li id='userModalUuid'><span class="userModalField">uuid</span> : <span>${user.login.uuid}</span></li>
        </ul>`
      )
  }

  function createTemplate(HTMLString){
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML =   HTMLString;
    return html.body.children[0];
  }

  function addEventClick ($element) {
    $element.addEventListener('click', () => {
      showModal($element);
    })
  }

  function renderMovieList(list, $container, category) {
    $container.children[0].remove();
    list.forEach(movie => {
      const HTMLString = videoItemTemplate(movie, category);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      const image = movieElement.querySelector('img')
      image.addEventListener('load', event => { event.srcElement.classList.add('fadeIn') } );
      addEventClick(movieElement);
    })
  }
  
  function renderUsers(list, $container) {
    $container.children[0].remove();
    list.forEach(user => {
      const HTMLString = userTemplate(user);
      const userElement = createTemplate(HTMLString);
      $container.append(userElement);
      const thumbnail = userElement.querySelector('img')
      thumbnail.addEventListener('load', event => { event.srcElement.classList.add('fadeIn') } )
      addEventClick(userElement)
    })
  }

  async function cacheExist(category) {
    const listName = `${category}List`;
    const cacheList = window.localStorage.getItem(listName);

    if (cacheList) {
      return JSON.parse(cacheList);
    }
    const { data: { movies: data } } = await getData(`${BASE_API}list_movies.json?genre=${category}`)
    window.localStorage.setItem(listName, JSON.stringify(data))

    return data;
  }

  const { results : users } = await getData('https://randomuser.me/api/?exc=info,registered,timezone,nat&results=20')
  const $usersContainer = document.getElementById('playlistFriends')
  renderUsers( users , $usersContainer )

  const actionList = await cacheExist('action');
  const $actionContainer = document.querySelector('#action');
  renderMovieList(actionList, $actionContainer, 'action');

  const dramaList = await await cacheExist('drama');
  const $dramaContainer = document.getElementById('drama');
  renderMovieList(dramaList, $dramaContainer, 'drama');

  const animationList = await await cacheExist('animation');
  const $animationContainer = document.getElementById('animation');
  renderMovieList(animationList, $animationContainer, 'animation');

  const $modal = document.getElementById('modal')
  const $overlay = document.getElementById('overlay')
  const $hideModal = document.getElementById('hide-modal')

  const $modalTitle = $modal.querySelector('h1')
  const $modalImage = $modal.querySelector('img')
  const $modalDescription = $modal.querySelector('p')

  function findById(list, id) {
    return list.find( movie => movie.id === parseInt(id, 10))
  }

  function findMovie(id, category){
    switch(category) {
      case 'action': {
        return findById(actionList, id)
      } 
      case 'drama': {
        return findById(dramaList, id)
      }
      default: {
        return findById(animationList, id)
      }
    }
  }

  function findUserByUuid(list, uuid) {
    return list.find( user => user.login.uuid === uuid )
  }

  function showModal($element) {
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';
    const id = $element.dataset.id;
    const uuid = $element.dataset.uuid;
    const category = $element.dataset.category;
    try{
      const data = findMovie(id, category);

      $modalTitle.textContent = data.title;
      $modalImage.setAttribute('src', data.medium_cover_image);
      $modalDescription.textContent = data.description_full
  
    }catch(err){
      const data = findUserByUuid(users, uuid)
      
      $modalTitle.textContent = data.login.username;
      $modalImage.setAttribute('src', data.picture.large);
      const HTMLString = userDescriptionTemplate(data);
      const descriptionElement = createTemplate(HTMLString);
      $modalDescription.append(descriptionElement);
    }
  }

  $hideModal.addEventListener('click', hideModal);
  
  function hideModal() {
    $overlay.classList.remove('active')
    $modal.style.animation = 'modalOut .8s forwards'
    setTimeout(() => $modalDescription.textContent = '', 800)
  }
})()
