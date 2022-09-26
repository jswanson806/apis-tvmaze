"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
  //empty array to hold shows with specific keys
  const showsArr = [];
  //iterate over res.data[] > save keys > push object to showsArr[] w/ key/val
  for(let i of res.data){
    const id = i.show.id;
    const name = i.show.name;
    const summary = i.show.summary;
    let image = i.show.image;
    //check if the property 'image' exists in res.data
    if(i.show.image != null){
      //set image variable
      const image = i.show.image.original;
      //add all variables to object and push to showsArr
      showsArr.push({id, name, summary, image});
    } else {
      //insert placeholder image if image property is null
      const image = "https://tinyurl.com/tv-missing";
      //add all variables to object and push to showsArr
      showsArr.push({id, name, summary, image});
    }
    
  }
  //log the response from axios.get
  console.log(res);
  //return the array containing shows objects
  return showsArr;
}


/** Given list of shows, create markup for each and add to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
           <img class="card-img-top" src="${show.image}" 
              alt="Poster image for ${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  //Empty arr to hold episodes
  const episodeArr = [];
  //iterate over res > save variables > push episode info objects to array
  for(let i of res.data){
    const id = i.id;
    const name = i.name;
    const season = i.season;
    const number = i.number;
    episodeArr.push({id, name, season, number});
  }
  return episodeArr;
}


/** Given an array of episodes, empty #episodes-list and populate ul with li 
 *    elements containing episode information.
 * 
 *    Each episodeLI should contain episode: name, season, number
 */

function populateEpisodes(episodes) { 
  //empty any current Li elements in #episodes-list
  $("#episodes-list").empty();
  //iterate over episodes arr > create Li elements with episode info > append Li elements to #episodes-list
  for (let i of episodes) {
    const episodeLI = $(`<li id='episode'>Title: ${i.name} (Season: ${i.season}, Episode: ${i.number})</li>`);
    $('#episodes-list').append(episodeLI);
  }
}

/** 
 * Handle clicks on the episodes button(s) within #shows-list
 *    Should reveal episodes area when Episodes btn is clicked, get the id of
 *    the show corresponding to the correct btn, and call getEpisodesOfShow()
 *    and populateEpisodes()
*/


  $("#shows-list").on('click', 'button', async function () {
    //reveal the #episodes-area
    $episodesArea.show();
    //search the DOM tree for the highest div created with populateShows() > grab show-id data and save to var
    const showID = $(this).closest('.Show.col-md-12.col-lg-6.mb-4').data('show-id');
    //wait for getEpisodesOfShow to return showID
    const episodeArr = await getEpisodesOfShow(showID);
    //call and pass the arr from getEpisodesOfShow()
    populateEpisodes(episodeArr);
  });