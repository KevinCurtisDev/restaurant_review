//Get restaurant list container from the dom
const restaurantsList = document.querySelector("#restaurant-list");
//Get add rating button from the dom
const addRating = document.getElementById("add-restaurant");
//Get modal from the dom
const modal = document.getElementById("modal");

//filter lower and higher values
let lower = 1;
let higher = 5;

let mymap = L.map('leafletMap')

let restaurantInfoList = [];



/****************************** HEADERS FOR ZOMATO API *****************************/
const myHeaders = new Headers();

myHeaders.append('Accept', 'application/json');
myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
myHeaders.append('user-key', '748ea5db9e15aad3e697838a729ec4ca');
/**********************************************************************************/



//Get user's current location
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
    
    /************************* GET USER REVIEWS OF RESTAURANTS *****************************/
    let restaurantID = 16774318;
    //fetch data from zomato api
    fetch(`https://developers.zomato.com/api/v2.1/reviews?res_id=${restaurantID}&start=1&count=5`, {
        async: true,
        crossDomain: true,
        method: 'GET',
        headers: myHeaders,
    })
        .then(function (response) { return response.json(); })
        .then(function (reviewsData) {
            console.log(reviewsData.user_reviews[0].review.rating_text);
        });

        //TODO: add reviews to restaurant listing
    /*************************************************************************************/
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







////////////////////////////////////////////////////////////////////

let newRestaurant = {
    restaurantName: "",
    newReview: {
        restaurantReview: "",
        restaurantRating: "",
        reviewerName: "",
    }
}

let newRestaurants = [];

//Store added estaurant details in session storage
sessionStorage.setItem("newReasaurants", newRestaurants);

document.getElementById("add-restaurant").addEventListener("click", () => {
    let user = document.getElementById("users-name").value;
    let restaurant = document.getElementById("restaurants-name").value;
    let review = document.getElementById("users-review").value;
    let rating = document.getElementById("restaurant-rating").value;

    newRestaurant.restaurantName = restaurant;

    newRestaurant.newReview.restaurantReview = review;
    newRestaurant.newReview.restaurantRating = rating;
    newRestaurant.newReview.reviewerName = user;

    //hide modal
    modal.style.display = "none";

    //reset the form values after submitting
    document.getElementById("newRestaurantForm").reset();
});

////////////////////////////////////////////////////////////////////

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
                higher = document.getElementById("higherRating").value;

                buildList(zomatoData);
            });
            buildMap(latlng, latcoord, longcoord);
            buildList(zomatoData);
            restaurantList(zomatoData);
        });
}

const restaurantList = (zomatoData) => {
    //clear previous list
    restaurantInfoList = [];
    for (let i = 0; i < zomatoData.nearby_restaurants.length; i++) {
        let individualRestaurant = [
            zomatoData.nearby_restaurants[i].restaurant.name,
            zomatoData.nearby_restaurants[i].restaurant.location.latitude,
            zomatoData.nearby_restaurants[i].restaurant.location.longitude,
            zomatoData.nearby_restaurants[i].restaurant.id,
            zomatoData.nearby_restaurants[i].restaurant.featured_image,
            zomatoData.nearby_restaurants[i].restaurant.location.address,
            []
        ];
        restaurantInfoList.push(individualRestaurant);
    }
    console.log(restaurantInfoList);
    restaurantMarkers(restaurantInfoList); 
}

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
    var greenIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    //Add user's location marker to map
    L.marker([latCoord, longCoord], { icon: greenIcon })
        //bind a pop up to user's marker that displays a message when clicked
        .bindPopup("hello map")
        .addTo(mymap);

    //Add new marker to map
    mymap.on('click', (e) => {
        L.marker(e.latlng)
            .bindPopup("new map marker")
            .addTo(mymap);

        //TODO: trigger modal and prompt for location information
        modal.style.display = "block";

        //TODO: bind modal info to marker and save in local storage
    });

    

}

const restaurantMarkers = (restaurantInfoList) => {
    //create markers based on the coordinates of listed close by restaurants
    for (var i = 0; i < restaurantInfoList.length; i++) {
        marker = new L.marker([restaurantInfoList[i][1], restaurantInfoList[i][2]])
            //add a popup to the map marker
            .bindPopup(restaurantInfoList[i][0])
            //add marker to map
            .addTo(mymap);
    }
}




const buildList = (zomatoData) => {
    //clear previous list before building dom
    restaurantsList.innerHTML = "";
    for (let i = 0; i < zomatoData.nearby_restaurants.length; i++) {
        if (zomatoData.nearby_restaurants[i].restaurant.user_rating.aggregate_rating >= `${lower}.0` &&
            zomatoData.nearby_restaurants[i].restaurant.user_rating.aggregate_rating <= `${higher}.0`
        ) {
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









