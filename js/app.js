//Restaurant list container
const restaurantsList = document.querySelector("#restaurant-list");
//filter lower values
let lower = 0;
const reviewList = document.getElementById("userReviews");
const newUserReviewsList = document.getElementById("newUserReviews");

/*************************** DOM BUTTON ELEMENTS *******************************/
const addRestaurant = document.getElementById("add-restaurant");
const addNewReview = document.getElementById("add-new-review");
const addReview = document.getElementById("add-review");
const submitNewRestaurantReview = document.getElementById("submit-review");
const submitReview = document.getElementById("submit");
const submitNewReview = document.getElementById("add-new-review");
const addRating = document.getElementById("add-restaurant");
const filterList = document.getElementById("filter");
/*******************************************************************************/


/******************************* DOM MODAL ELEMENTS ****************************/
const modal = document.getElementById("modal");
const modalContainer = document.getElementById("modal-container");
const reviewModal = document.getElementById("reviewModal");
const newRestaurantReviewModal = document.getElementById("newRestaurantReviewModal");
const newRestaurantAddReviewModal = document.getElementById("new-restaurant-modal-review");
const reviewModalContainer = document.getElementById("reviewModal-container");
const closeModal = document.getElementById("close-modal");
const closeModal2 = document.getElementById("close-modal2");
const modalReview = document.getElementById("modal-review");
/******************************************************************************/


/********************************* MAP VARIABLES ******************************/
//Map
let mymap = L.map('leafletMap');

//Map layer
let markerGroup = L.layerGroup();

//Map Markers array
let markers = [];
/******************************************************************************/


/********************************* ARRAY VARIABLES ******************************/
//Array of newly added restaurants
let newRestaurants = [];

//Array of information on preexisting restaurant list
let restaurantInfoList = [];
/******************************************************************************/


/**************************** GEOGRAPHICAL VARIABLES **************************/
//lattitude and longitude
let latlng;

//latitude
let latCoord;

//longitude
let longCoord;
/******************************************************************************/

/****************************** HEADERS FOR ZOMATO API *****************************/
const myHeaders = new Headers();

myHeaders.append('Accept', 'application/json');
myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
myHeaders.append('user-key', '748ea5db9e15aad3e697838a729ec4ca');
/**********************************************************************************/







/********************************** CONSTRUCTOR FUNCTIONS **********************************/

//Constructor function for new restaurant
function NewRestaurant(restaurantName, restaurantLocation, restaurantLat, restaurantLong, restaurantStars, restaurantReviews, restaurantAddress) {
    this.restaurantName = restaurantName;
    this.restaurantLocation = restaurantLocation;
    this.restaurantLat = restaurantLat;
    this.restaurantLong = restaurantLong;
    this.restaurantStars = restaurantStars;
    this.restaurantReviews = restaurantReviews;
    this.restaurantAddress = restaurantAddress;
}

//Constructor function for new reviews
function NewReview(user, comment, stars) {
    this.user = user;
    this.comment = comment;
    this.stars = stars;
}
/*******************************************************************************************/









/******************************* Get user's current geographical location ***************************/

const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(function (location) {

        //set variable for user's current coordinates
        latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
        latCoord = location.coords.latitude;
        longCoord = location.coords.longitude;

        /*
        Access restaurant data from the zomato API
        */
        getApiRestaurants(latlng, latCoord, longCoord);
        getRestaurants();
        buildMap(latlng);
    });
}

getCurrentLocation();
/*************************************************************************************************/



const getRestaurants = () => {
    //fetch geolocation based on hard coded json data
    fetch("/data/data.json")
        .then(function (response) { return response.json(); })
        .then(function (data) {
            console.log(data);
            restaurantList(data);
            buildMap();
        });

}



/****************************** store restaurant data in array and generate markers ************************/

const restaurantList = (data) => {

    restaurantInfoList = [];

    for (let i = 0; i < data.reviews.length; i++) {
        if (data.reviews[i].rating >= `${lower}`) {
            let individualRestaurant = [
                data.reviews[i].restaurantName,
                data.reviews[i].M,
                data.reviews[i].lat,
                data.reviews[i].long,
                data.reviews[i].rating,
                data.reviews[i].ratings,
                data.reviews[i].address
            ];
            restaurantInfoList.push(individualRestaurant);
        }

        mymap.addLayer(markerGroup);
    }
    restaurantMarkers(restaurantInfoList);
}
/******************************************************************************************************/




/*
******************************** Build map and set user's current location ******************************
*/

const userPositionIcon = () => {
    //Create a user position map marker
    let redIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    //Add user position map marker to map
    me = L.marker([latCoord, longCoord], { icon: redIcon })
        //bind a pop up to user's marker that displays a message when clicked
        .bindPopup("You are here!")
        .addTo(mymap);
}


const buildMap = (latlng) => {
    mymap.setView(latlng, 12)
    // BUILD THE MAP
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoia2V2aW4xOTgxIiwiYSI6ImNqdG16emNoMDJnaTAzeXJyNjNyaXVmYWkifQ.h4o3OiiEqYEzarChFx7-8Q'
    }).addTo(mymap);

    userPositionIcon();
    //Get map boundaries
    mapBounds = mymap.getBounds();
}


/*
************************************ Add new marker to map *********************************
*/

let newRestauratMarkers = [];
//Right click on map to add a new restaurant
mymap.on("contextmenu", (e) => {

    newRestauratMarkers.push(e.latlng)

    marker = new L.marker(e.latlng)
        .bindPopup("Your new restaurant")
        .addTo(mymap);

    let coord = e.latlng;
    markers.push(marker);

    //Create new restaurant object and add it to the newRestaurants array
    addRestaurant.addEventListener("click", (e) => {
        e.preventDefault();

        let userRestaurantName = document.getElementById("restaurants-name").value;
        let newRestaurantLocation = coord;
        let newRestaurantLat = coord.lat;
        let newRestaurantLong = coord.lng;
        let newRestaurantStars = Number(document.getElementById("new-restaurant-rating").value);
        let newRestaurantReviews = [];
        let newRestaurantAddress = document.getElementById("restaurants-address").value;;

        let userRestaurant = new NewRestaurant(
            userRestaurantName,
            newRestaurantLocation,
            newRestaurantLat,
            newRestaurantLong,
            newRestaurantStars,
            newRestaurantReviews,
            newRestaurantAddress
        );

        let newRestaurantDetails =
            [
                userRestaurant.restaurantName,
                userRestaurant.restaurantLocation,
                userRestaurant.restaurantLat,
                userRestaurant.restaurantLong,
                userRestaurant.restaurantStars,
                userRestaurant.restaurantReviews,
                userRestaurant.restaurantAddress
            ]
        if (userRestaurant.restaurantName) {
            restaurantInfoList.push(newRestaurantDetails);
            buildList(lower);
            restaurantMarkers(restaurantInfoList);
        }

        modalControls.closeModal()

        //reset form
        document.getElementById("newRestaurantForm").reset();

    });

    marker.on("click", () => {
        //clear any previously loaded data
        newUserReviewsList.innerHTML = "";

        //check if marker location matches a stored restaurant location
        let found = restaurantInfoList.find(function (obj) {
            return obj[1] == coord;
        });

        //Build the restaurant info for the newly created restaurant

        newUserReviewsList.prepend(found[0]);

        if (found[5][0]) {
            for (let i = 0; i < found[5].length; i++) {
                newUserReviewsList.append(found[5][i].user);
            }
        }


        modalControls.openNewRestaurantReviews();

        submitNewRestaurantReview.addEventListener("click", (e) => {
            e.preventDefault();

            //Modal submit review control
            modalControls.submitNewRestaurantReview();

            //Get the input values of the review
            let newRestaurantReviewUser = document.getElementById("restaurant-review-user").value;
            let newRestaurantReviewReview = document.getElementById("restaurant-review-review").value;
            let newRestaurantReviewRating = document.getElementById("restaurant-review-rating").value;

            let newReview = new NewReview(newRestaurantReviewUser, newRestaurantReviewReview, newRestaurantReviewRating);

            if (newReview.user && newReview.comment) {
                //Push review to the selected restaurant
                found[5].push(newReview);
            }
            document.getElementById("add-new-review-form").reset();

        });

    });

    modalControls.showModal();

});




addNewReview.addEventListener("click", (e) => {
    e.preventDefault();
    modalControls.addNewReview();
});

addReview.addEventListener("click", (e) => {
    e.preventDefault();
    modalControls.addReview();
});


/*
****************************** Create resaurant markers and reviews ******************************
*/

const restaurantMarkers = (restaurantInfoList) => {
    console.log(restaurantInfoList)
    //Check if a markers array has been created
    if (markers) {
        //loop through the markers array and remove each marker
        markers.forEach(marker => marker.remove());
    }
    //set markers array to empty
    markers = [];

    //Because we're executing a review submission inside a for loop, 
    //we can create an array in order to access the final restaurant value of the for loop. 
    //Otherwise the review will always go to the first restaurant clicked on
    let idArray = [];

    //create markers based on the coordinates of listed close by restaurants
    for (let i = 0; i < restaurantInfoList.length; i++) {
        let id = i;
        marker = new L.marker([restaurantInfoList[i][2], restaurantInfoList[i][3]])
            //add a popup to the map marker
            .bindPopup(restaurantInfoList[i][0])
            //add marker to map
            .addTo(markerGroup);

        //populate markers array with updated markers
        markers.push(marker);
        marker.on("click", (e) => {
            reviewList.innerHTML = "";
            const restaurantName = document.createElement("h2");
            restaurantName.innerHTML = restaurantInfoList[id][0];

            reviewList.prepend(restaurantName);

            for (let j = 0; j < restaurantInfoList[id][5].length; j++) {

                let reviewElement = document.createElement("li");
                reviewElement.classList.add("review");

                let reviewersName = document.createElement("p");
                reviewersName.innerHTML = `Reviewer: ${restaurantInfoList[id][5][j].user}`;

                let reviewersReview = document.createElement("p");
                reviewersReview.innerHTML = `Comment: ${restaurantInfoList[id][5][j].comment}`;

                let reviewersRating = document.createElement("p");
                reviewersRating.innerHTML = `Rating: ${restaurantInfoList[id][5][j].stars}`;


                reviewElement.append(reviewersName, reviewersReview, reviewersRating);
                reviewList.append(reviewElement);
            }

            idArray.push(id);

            submitReview.addEventListener("click", (e) => {
                let num = idArray[idArray.length - 1];
                e.preventDefault();
                //Modal submit review control
                modalControls.submitReview();

                //Get the input values of the review
                let newRestaurantReviewUser = document.getElementById("new-restaurant-review-user").value;
                let newRestaurantReviewReview = document.getElementById("new-restaurant-review-review").value;
                let newRestaurantReviewRating = document.getElementById("new-restaurant-review-rating").value;

                let newReview = new NewReview(newRestaurantReviewUser, newRestaurantReviewReview, newRestaurantReviewRating);

                if (newReview.user && newReview.comment) {
                    //Push review to the selected restaurant
                    console.log(num)
                    restaurantInfoList[num][5].push(newReview);
                }

                document.getElementById("add-review-form").reset();

            });

            //open a modal to show restaurant reviews
            modalControls.openRestaurantReviews();

        });

    }

}



/*
************************* Build restaurant info HTML list to right of map ***************************
*/

const buildList = (lower) => {
    //clear previous list before building dom
    restaurantsList.innerHTML = "";

    for (let i = 0; i < restaurantInfoList.length; i++) {
        if (restaurantInfoList[i][4] >= `${lower}`) {
            let resatarantId = i;

            let restaurantDetails = document.createElement("li");
            restaurantDetails.classList.add("review");

            let restaurantListImage = document.createElement("img");

            if (restaurantInfoList[resatarantId][7]) {
                let source = restaurantInfoList[resatarantId][7];
                restaurantListImage.setAttribute("src", source);
            } else {
                let source = "https://cmkt-image-prd.global.ssl.fastly.net/0.1.0/ps/1711885/580/386/m1/fpnw/wm0/fork-knife-and-plate-icon-.jpg?1475219944&s=a8a57bef407147a1542ab525ebd9a0ae";
                restaurantListImage.setAttribute("src", source);
            }

            let restaurantListName = document.createElement("p");
            restaurantListName.innerHTML = `Restaurant name: ${restaurantInfoList[resatarantId][0]}`;

            let restaurantListAddress = document.createElement("p");
            restaurantListAddress.innerHTML = `Address: ${restaurantInfoList[resatarantId][6]}`;

            let restaurantListRating = document.createElement("p");
            restaurantListRating.innerHTML = `Rating: ${restaurantInfoList[resatarantId][4]}`;


            restaurantsList.append(restaurantDetails);
            restaurantDetails.append(restaurantListImage, restaurantListName, restaurantListAddress, restaurantListRating);
        }
    }

}



/**************************************** MODAL CONTROL FLOW ***********************************/


const modalControls = {
    closeModal: () => {
        reviewModalContainer.style.display = "none";
        reviewModalContainer.style.opacity = "0";
        reviewModal.style.display = "none";
    },
    closeModalBackground: () => {
        reviewModalContainer.style.display = "none";
        reviewModalContainer.style.opacity = "0";
        reviewModal.style.display = "none";
    },
    showModal: () => {
        modalContainer.style.display = "block";
        modalContainer.style.opacity = "1";
        modal.style.display = "block";
    },
    closeModal: () => {
        modalContainer.style.display = "none";
        modalContainer.style.opacity = "0";
        modal.style.display = "none";
        newRestaurantReviewModal.style.display = "none";
        reviewModalContainer.style.display = "none";
        reviewModalContainer.style.opacity = "0";
        reviewModal.style.display = "none";
    },
    openRestaurantReviews: () => {
        reviewModalContainer.style.display = "block";
        reviewModalContainer.style.opacity = "1";
        reviewModal.style.display = "block";
    },
    openNewRestaurantReviews: () => {
        reviewModalContainer.style.display = "block";
        reviewModalContainer.style.opacity = "1";
        newRestaurantReviewModal.style.display = "block";
    },
    addReview: () => {
        reviewModal.style.display = "none";
        modalReview.style.display = "block";
    },
    addNewReview: () => {
        newRestaurantReviewModal.style.display = "none";
        newRestaurantAddReviewModal.style.display = "block";
    },
    submitReview: () => {
        modalContainer.style.display = "none";
        modalReview.style.display = "none";
        reviewModalContainer.style.display = "none";
        reviewModalContainer.style.opacity = "0";
    },
    submitNewRestaurantReview: () => {
        modalContainer.style.display = "none";
        modalReview.style.display = "none";
        newRestaurantReviewModal.style.display = "none";
        reviewModalContainer.style.display = "none";
        reviewModalContainer.style.opacity = "0";
        newRestaurantAddReviewModal.style.display = "none";
    }
}

/*
** close modal
*/

closeModal.addEventListener("click", () => {
    modalControls.closeModal();
});

reviewModalContainer.addEventListener("click", () => {
    modalControls.closeModalBackground();
});

closeModal2.addEventListener("click", () => {
    modalControls.closeModal();
});



//FORM VALIDATION 
const validateForm = () => {
    return false;
};









/************************************ get restaurant details from zomato API ************************************/

const getApiRestaurants = (latlng, latcoord, longcoord) => {
    restaurantInfoList = [];
    //fetch geolocation based data from zomato api
    fetch(`https://developers.zomato.com/api/v2.1/geocode?lat=${latcoord}&lon=${longcoord}`, {
        async: true,
        crossDomain: true,
        method: 'GET',
        headers: myHeaders,
    })
        .then(function (response) { return response.json(); })
        .then(function (zomatoData) {
            for (let i = 0; i < zomatoData.nearby_restaurants.length; i++) {

                let restaurantApiName = zomatoData.nearby_restaurants[i].restaurant.name;
                let restaurantApiLat = zomatoData.nearby_restaurants[i].restaurant.location.latitude;
                let restaurantApiLong = zomatoData.nearby_restaurants[i].restaurant.location.longitude;
                let restaurantApiLatLng = { restaurantApiLat, restaurantApiLong }
                let restaurantApiId = zomatoData.nearby_restaurants[i].restaurant.id;
                let restaurantApiComments = [];
                let restaurantApiImg = zomatoData.nearby_restaurants[i].restaurant.featured_image;
                let restaurantApiAddress = zomatoData.nearby_restaurants[i].restaurant.location.address;
                let restaurantApiRating = zomatoData.nearby_restaurants[i].restaurant.user_rating.aggregate_rating;



                let newZomatoRestaurant = [
                    restaurantApiName,
                    restaurantApiLatLng,
                    restaurantApiLat,
                    restaurantApiLong,
                    restaurantApiRating,
                    restaurantApiComments,
                    restaurantApiAddress,
                    restaurantApiImg,
                    restaurantApiId
                ]

                getZomatoRestaurantReviews(restaurantApiId, restaurantApiComments);
                console.log(restaurantApiId);
                restaurantInfoList.push(newZomatoRestaurant);

            }
            restaurantMarkers(restaurantInfoList);
            buildMap(latlng, latcoord, longcoord);
            buildList(lower);
        });
}
/**********************************************************************************************************/



/******************************* get restaurant reviews from zomato API *********************************/

const getZomatoRestaurantReviews = (restaurantID, restaurantApiComments) => {
    fetch(`https://developers.zomato.com/api/v2.1/reviews?res_id=${restaurantID}&start=1&count=8`, {
        async: true,
        crossDomain: true,
        method: 'GET',
        headers: myHeaders,
    })
        .then(function (response) { return response.json(); })
        .then(function (reviewsData) {
            console.log(reviewsData);
            //loop through reviews 
            for (let i = 0; i <= reviewsData.user_reviews.length; i++) {
                if (reviewsData.user_reviews[i]) {
                    let reviewText = reviewsData.user_reviews[i].review.review_text;

                    let reviewRating = reviewsData.user_reviews[i].review.rating;

                    let reviewUserName = reviewsData.user_reviews[i].review.user.name;

                    let newZomatoRestaurantReview = {
                        user: reviewUserName,
                        stars: reviewRating,
                        comment: reviewText
                    }
                    restaurantApiComments.push(newZomatoRestaurantReview);
                }

            }

        });
}
/**********************************************************************************************************/


/************************ search for restaurants in specific geographical location *************************/

document.getElementById("search-btn").addEventListener("click", () => {

    let location = document.getElementById("search-field").value

    //Use mapquest API for forward geocoding of inputted location
    let url = "http://open.mapquestapi.com/geocoding/v1/address?key=dc009bsV74eyrcwA6HtOEGXWDIDLKABg&location=" + location;

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
            getApiRestaurants(latlong, lat, long);
            restaurantMarkers(restaurantInfoList);
        });

    //reset search input field
    document.getElementById("search-form").reset();
});
/**********************************************************************************************************/



//Apply filter
filterList.addEventListener("click", (e) => {
    e.target.preventDefault;
    lower = document.getElementById("lowerRating").value;

    buildList(lower);
});