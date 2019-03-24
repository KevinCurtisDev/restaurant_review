//Get restaurant list container from the dom
const restaurantsList = document.querySelector("#restaurant-list");
//Get add rating button from the dom
const addRating = document.getElementById("add-restaurant");

//use fetch api to retrieve restaurant data
fetch("/data/data.json")
    .then(function (response) { return response.json(); })
    .then(function (data) {
        //check that we're getting the correct response
        console.log(data.reviews[0].restaurantName);

//Get user's current location
navigator.geolocation.getCurrentPosition(function (location) {
    //set variable for user's coordinates
    var latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);

    //set leafletJS map view to user's current position
    var mymap = L.map('leafletMap').setView(latlng, 13)
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoia2V2aW4xOTgxIiwiYSI6ImNqdG16emNoMDJnaTAzeXJyNjNyaXVmYWkifQ.h4o3OiiEqYEzarChFx7-8Q'
    }).addTo(mymap);

    L.marker(latlng).addTo(mymap)
    //add a popupto the map marker
        .bindPopup(`${data.reviews[0].restaurantName} <br> ${data.reviews[0].address}`);

    mymap.addEventListener("click", function (e) {
        var mp = new L.Marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        alert(mp.getLatLng());
    });
});


addRating.addEventListener("click", (e) => {
    e.preventDefault();
    //empty the list of restaurnts before rebuilding the list in the dom
    restaurantsList.innerHTML = "";

    const addComment = document.getElementById("restaurant-comment").value;
    const addRating = document.getElementById("restaurant-rating").value;
    let newReview = {};
    newReview["stars"] = addRating;
    newReview["comment"] = addComment;

    data.reviews[0].ratings.push(newReview);
    populateRestaurantHtml();
});

     
//function that creates and adds restaurant data to the dom
const populateRestaurantHtml = () => {
    for (let i = 0; i <= data.reviews.length; i++) {
        let restaurantDetails = document.createElement("li");
        restaurantDetails.classList.add("review");

        let restaurantTitle = document.createElement("p");
        restaurantTitle.innerHTML = data.reviews[i].restaurantName;

        let restaurantAddress = document.createElement("p");
        restaurantAddress.innerHTML = data.reviews[i].address;

        restaurantTitle.append(restaurantAddress);
        restaurantDetails.append(restaurantTitle);
        restaurantsList.append(restaurantDetails);

        for (let j = 0; j <= data.reviews[i].ratings.length - 1; j++) {
            let restaurantReview = document.createElement("p");
            let restaurantStars = document.createElement("p");
            restaurantStars.innerHTML = `Rating: ${data.reviews[i].ratings[j].stars}`;
            restaurantReview.innerHTML = `Review: ${data.reviews[i].ratings[j].comment}`;
            restaurantAddress.append(restaurantReview);
            restaurantReview.append(restaurantStars);
        }

    }
}

populateRestaurantHtml();

});  



/*
*
Access restaurant data from the zomato API
*
*/

//set headers for zomato API
const myHeaders = new Headers();

myHeaders.append('Accept', 'application/json');
myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
myHeaders.append('user-key', '748ea5db9e15aad3e697838a729ec4ca');

//fetch data from zomato api
fetch('https://developers.zomato.com/api/v2.1/geocode?lat=53.3498&lon=-6.2603', {
        async: true,
        crossDomain: true,
        method: 'GET',
        headers: myHeaders,
    })
        .then(function (response) { return response.json(); })
        .then(function (zomatoData) {
            console.log(zomatoData.location.city_name)
});