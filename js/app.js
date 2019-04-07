//Get restaurant list container from the dom
const restaurantsList = document.querySelector("#restaurant-list");
//Get add rating button from the dom
const addRating = document.getElementById("add-restaurant");
//Get modal from the dom
const modal = document.getElementById("modal");
const modalContainer = document.getElementById("modal-container");

const reviewModal = document.getElementById("reviewModal");
const reviewList = document.getElementById("userReviews");
const reviewModalContainer = document.getElementById("reviewModal-container");
const closeModal = document.getElementById("close-modal");

let markerGroup = L.layerGroup();

let newRestaurants = [];

let mymap = L.map('leafletMap');


//filter lower values
let lower = 0;

let restaurantInfoList = [];

//Markers array
let markers = [];



/****************************** HEADERS FOR ZOMATO API *****************************/
const myHeaders = new Headers();

myHeaders.append('Accept', 'application/json');
myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
myHeaders.append('user-key', '748ea5db9e15aad3e697838a729ec4ca');
/**********************************************************************************/


/*
****************************** Get user's current geographical location ***************************
*/

navigator.geolocation.getCurrentPosition(function (location) {

    //set variable for user's coordinates
    let latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
    let latCoord = location.coords.latitude;
    let longCoord = location.coords.longitude;

    /*
    Access restaurant data from the zomato API
    */
    getRestaurants(latlng, latCoord, longCoord);
    buildMap(latlng, latCoord, longCoord);   
});


//search for restaurants in specific geographical location
document.getElementById("search-btn").addEventListener("click", () => {
    
    let location = document.getElementById("search-field").value
    
    let url = "http://open.mapquestapi.com/geocoding/v1/address?key=dc009bsV74eyrcwA6HtOEGXWDIDLKABg&location="+location;

    fetch(url, {
        async: true,
        crossDomain: true,
        method: 'GET',
    })
        .then(function (response) { return response.json(); })
        .then(function (geoData) {
            let lat = geoData.results[0].locations[0].displayLatLng.lat;
            let long = geoData.results[0].locations[0].displayLatLng.lng;
            let latlong = new L.LatLng(lat, long);
            console.log(geoData.results[0].locations[0].displayLatLng.lat, geoData.results[0].locations[0].displayLatLng.lng);
            getRestaurants(latlong, lat, long);
        });

    //reset search input field
    document.getElementById("search-form").reset();
});




const validateForm = () => {
    return false;
};



const getRestaurants = (latlng, latcoord, longcoord) => {
    //fetch geolocation based data from zomato api
    fetch(`https://developers.zomato.com/api/v2.1/geocode?lat=${latcoord}&lon=${longcoord}`, {
        async: true,
        crossDomain: true,
        method: 'GET',
        headers: myHeaders,
    })
        .then(function (response) { return response.json(); })
        .then(function (zomatoData) {


            //Apply filter before rebuilding the restaurant list
            document.getElementById("filter").addEventListener("click", (e) => {
                e.target.preventDefault;

                restaurantsList.innerHTML = "";

                lower = document.getElementById("lowerRating").value;

                buildList(zomatoData);
                restaurantList(zomatoData);
            });
            buildMap(latlng, latcoord, longcoord);
            buildList(zomatoData);
            restaurantList(zomatoData);
        });
}



/*
***************************** store restaurant data in array and generate markers **************************
*/


const restaurantList = (zomatoData) => {

    restaurantInfoList = [];
    
    for (let i = 0; i < zomatoData.nearby_restaurants.length; i++) {
        
        if (zomatoData.nearby_restaurants[i].restaurant.user_rating.aggregate_rating >= `${lower}`){
            let individualRestaurant = [
                zomatoData.nearby_restaurants[i].restaurant.name,
                zomatoData.nearby_restaurants[i].restaurant.location.latitude,
                zomatoData.nearby_restaurants[i].restaurant.location.longitude,
                zomatoData.nearby_restaurants[i].restaurant.id,
                zomatoData.nearby_restaurants[i].restaurant.featured_image,
                zomatoData.nearby_restaurants[i].restaurant.location.address,
                zomatoData.nearby_restaurants[i].restaurant.user_rating.aggregate_rating
            ];
            restaurantInfoList.push(individualRestaurant);
        }
        mymap.addLayer(markerGroup);
    }
    
    restaurantMarkers(restaurantInfoList); 
}


/*
******************************** Build map and set user's current location ******************************
*/

const buildMap = (latlng, latCoord, longCoord) => {
    
    mymap.setView(latlng, 13)
    // BUILD THE MAP AND ADD MARKERS 
    //set leafletJS map view to user's current position
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoia2V2aW4xOTgxIiwiYSI6ImNqdG16emNoMDJnaTAzeXJyNjNyaXVmYWkifQ.h4o3OiiEqYEzarChFx7-8Q'
    }).addTo(mymap);
    

    //Create map marker for user's current location
    var redIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    //Add user's location marker to map
    me = L.marker([latCoord, longCoord], { icon: redIcon })
        //bind a pop up to user's marker that displays a message when clicked
        .bindPopup("You are here!")
        .addTo(mymap);

}

//Constructor function for new restaurant
function NewRestaurant(restaurantName, userName, userReview, userRating) {
    this.restaurantName = restaurantName;
    this.userName = userName;
    this.userReview = userReview;
    this.userRating = userRating;
}

/*
************************************ Add new marker to map *********************************
*/

mymap.on("contextmenu", (e) => {

    document.getElementById("add-restaurant").addEventListener("click", () => {

        let user = document.getElementById("users-name").value;
        let restaurant = document.getElementById("restaurants-name").value;
        let review = document.getElementById("users-review").value;
        let rating = document.getElementById("restaurant-rating").value;

        //hide modal
        modal.style.display = "none";
        modalContainer.style.display = "none";
        modalContainer.style.opacity = "0";

        newRestaurants.push(newRestaurant);
        //buildList(restaurantInfoList);
        console.log(newRestaurants)

        //reset the form values after submitting
        document.getElementById("newRestaurantForm").reset();
    
    });

    marker = new L.marker(e.latlng, {name: name})
        .bindPopup("Damn you leafletJS, You won this round!")
        .addTo(mymap);

    
    //restaurant.coordintes = e.latlng;
    //newRestaurants.push(restaurant);

    //TODO: access marker latlng  
    marker.on("click", (e) => {
        console.log(e.target.options.name)
        reviewList.innerHTML = "";
        reviewModal.style.display = "block";
        reviewModalContainer.style.display = "block";
        reviewModalContainer.style.opacity = "1";

        //TODO: search newRestaurants array for matching coordinates
    });
    

    modalContainer.style.display = "block";
    modalContainer.style.opacity = "1";
    modal.style.display = "block";

});


/*
****************************** Create resaurant markers and reviews ******************************
*/

const restaurantMarkers = (restaurantInfoList) => {
    mymap.removeLayer(me);
    console.log(markers);
    //Check if a markers array has been created
    if (markers) {
        //loop through the markers array and remove each marker
        markers.forEach(marker => marker.remove());
    }
    //set markers array to empty
    markers = [];

    //create markers based on the coordinates of listed close by restaurants
    for (var i = 0; i < restaurantInfoList.length; i++) {
        let id = i;
        marker = new L.marker([restaurantInfoList[i][1], restaurantInfoList[i][2]], { myCustomId: id })
            //add a popup to the map marker
            .bindPopup(restaurantInfoList[i][0])
            //add marker to map
            .addTo(markerGroup);

            //populate markers array with updated markers
            markers.push(marker);
            
        

        marker.on("click", (e) => {
            reviewList.innerHTML = "";
            const restaurntName = document.createElement("h2");
            restaurntName.innerHTML = restaurantInfoList[id][0];
            

            //Get user reviews for specific restaurant
            let restaurantID = restaurantInfoList[id][3];
            //fetch review data from zomato api
            fetch(`https://developers.zomato.com/api/v2.1/reviews?res_id=${restaurantID}&start=1&count=8`, {
                async: true,
                crossDomain: true,
                method: 'GET',
                headers: myHeaders,
            })
                .then(function (response) { return response.json(); })
                .then(function (reviewsData) {

                    //loop through reviews 
                    for (let i = 0; i <= reviewsData.user_reviews.length; i++){
                        //if there are no reviews, show no reviews message
                        if (reviewsData.user_reviews.length <= 1) {
                            let listItem = document.createElement("li");
                            listItem.innerHTML = "Sorry, this restaurant has no reviews yet :'(";
                            reviewList.append(listItem);
                            reviewList.prepend(restaurntName);
                        }else {
                            //if there are reviews build and populate reviews html 
                            let listItem = document.createElement("li");
                            listItem.classList.add("review");

                            let reviewText = document.createElement("p");
                            reviewText.innerHTML = reviewsData.user_reviews[i].review.review_text;

                            let reviewRating = document.createElement("p");
                            reviewRating.innerHTML = `User Rating: ${reviewsData.user_reviews[i].review.rating}/5`;

                            let reviewUserName = document.createElement("p");
                            reviewUserName.innerHTML = reviewsData.user_reviews[i].review.user.name;

                            reviewList.prepend(restaurntName);
                            reviewList.append(listItem);

                            listItem.append(reviewUserName);
                            listItem.append(reviewRating);
                            listItem.append(reviewText);
                        }
                         
                    }

                });

            //open a modal to show restaurant reviews
            reviewModalContainer.style.display = "block";
            reviewModalContainer.style.opacity = "1";
            reviewModal.style.display = "block";
            
        });
        
    }

}


/*
************************* Build restaurant info HTML list to right of map ***************************
*/

const buildList = (zomatoData) => {
    //clear previous list before building dom
    restaurantsList.innerHTML = "";
    for (let i = 0; i < zomatoData.nearby_restaurants.length; i++) {
        if (zomatoData.nearby_restaurants[i].restaurant.user_rating.aggregate_rating >= `${lower}`) {

            let resatarantId = i;
            console.log(resatarantId)
            let restaurantDetails = document.createElement("li");
            restaurantDetails.classList.add("review");

            let zomatoImg = document.createElement("img");
            let source = zomatoData.nearby_restaurants[i].restaurant.featured_image;
            zomatoImg.setAttribute("src", source);

            let zomatohtml = document.createElement("p");
            zomatohtml.innerHTML = `Restaurant name: ${zomatoData.nearby_restaurants[i].restaurant.name}`;
            zomatohtml.id = zomatoData.nearby_restaurants[i].restaurant.id;

            let zomatoAddress = document.createElement("p");
            zomatoAddress.innerHTML = `Address: ${zomatoData.nearby_restaurants[i].restaurant.location.address}`;

            let zomatoRating = document.createElement("p");
            zomatoRating.innerHTML = `Rating: ${zomatoData.nearby_restaurants[i].restaurant.user_rating.aggregate_rating}, ${zomatoData.nearby_restaurants[i].restaurant.user_rating.rating_text}`;


            restaurantsList.append(restaurantDetails);
            restaurantDetails.append(zomatoImg);
            restaurantDetails.append(zomatohtml);
            zomatohtml.append(zomatoAddress);
            zomatoAddress.append(zomatoRating);
        }
    }
    
}


/*
*************************************** close modal **************************************
*/

closeModal.addEventListener("click", () => {
    reviewModalContainer.style.display = "none";
    reviewModalContainer.style.opacity = "0";
    reviewModal.style.display = "none"; 
});

reviewModalContainer.addEventListener("click", () => {
    reviewModalContainer.style.display = "none";
    reviewModalContainer.style.opacity = "0";
    reviewModal.style.display = "none";
});



