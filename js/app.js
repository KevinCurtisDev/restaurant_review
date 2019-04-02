//Get restaurant list container from the dom
const restaurantsList = document.querySelector("#restaurant-list");
//Get add rating button from the dom
const addRating = document.getElementById("add-restaurant");
//Get modal from the dom
const modal = document.getElementById("modal");

//filter lower and higher values
let lower = 1;
let higher = 5;

//Get user's current location
navigator.geolocation.getCurrentPosition(function (location) {

    //set variable for user's coordinates
    var latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
    console.log(latlng);

    /*
    Access restaurant data from the zomato API
    */

    /****************************** HEADERS FOR ZOMATO API *****************************/
    const myHeaders = new Headers();
    
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
    myHeaders.append('user-key', '748ea5db9e15aad3e697838a729ec4ca');
    /**********************************************************************************/


    //fetch geolocation based data from zomato api
    fetch(`https://developers.zomato.com/api/v2.1/geocode?lat=${location.coords.latitude}&lon=${location.coords.longitude}`, {
        async: true,
        crossDomain: true,
        method: 'GET',
        headers: myHeaders,
    })
        .then(function (response) { return response.json(); })
        .then(function (zomatoData) {

            let restaurantInfoList = [];

            //Apply filter before rebuilding the restaurant list
            document.getElementById("filter").addEventListener("click", (e) => {
                e.target.preventDefault;

                restaurantsList.innerHTML = "";

                lower = document.getElementById("lowerRating").value;
                higher = document.getElementById("higherRating").value; 

                buildList();
            }); 

            const buildList = ()=> {
                for (let i = 0; i < zomatoData.nearby_restaurants.length; i++) {
                    if (zomatoData.nearby_restaurants[i].restaurant.user_rating.aggregate_rating >= `${lower}.0` &&
                        zomatoData.nearby_restaurants[i].restaurant.user_rating.aggregate_rating <= `${higher}.0`
                    ) {
                        let restaurantDetails = document.createElement("li");
                        restaurantDetails.classList.add("review");

                        let zomatoImg = document.createElement("img");
                        let source = zomatoData.nearby_restaurants[i].restaurant.featured_image;
                        console.log(source);
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

                        let individualRestaurant = [
                            zomatoData.nearby_restaurants[i].restaurant.name,
                            zomatoData.nearby_restaurants[i].restaurant.location.latitude,
                            zomatoData.nearby_restaurants[i].restaurant.location.longitude,
                            zomatoData.nearby_restaurants[i].restaurant.id
                        ];
                        restaurantInfoList.push(individualRestaurant);
                    } 
                }
            }
                
            buildList();
            
            
            console.log(restaurantInfoList);

    /************************************* BUILD MAP AND ADD MARKERS *********************************/
            //set leafletJS map view to user's current position
            let mymap = L.map('leafletMap').setView(latlng, 13)
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://mapbox.com">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: 'pk.eyJ1Ijoia2V2aW4xOTgxIiwiYSI6ImNqdG16emNoMDJnaTAzeXJyNjNyaXVmYWkifQ.h4o3OiiEqYEzarChFx7-8Q'
            }).addTo(mymap);

            L.marker(latlng).addTo(mymap).on('click', (e) => {
                alert(e.latlng);
            });

            //Add new marker to map
            mymap.on('click', (e) => {
		 		var coord = e.latlng.toString().split(',');
                 L.marker(e.latlng).addTo(mymap);
                 
                 //TODO: trigger modal and prompt for location information
                 modal.style.display = "block";

                 let newRestaurant = {
                     restaurantName: 1,
                     restaurantReview: 2,
                     restaurantRating: 3,
                     reviewerName: 4,
                     restaurantImgUrl: "abcd"
                 }

                 //TODO: bind modal info to marker and save in local storage
		 	});
            
            //create markers based on the coordinates of listed close by restaurants
            for (var i = 0; i < restaurantInfoList.length; i++) {
                marker = new L.marker([restaurantInfoList[i][1], restaurantInfoList[i][2]])
                    //add a popup to the map marker
                    .bindPopup(restaurantInfoList[i][0])
                    //add marker to map
                    .addTo(mymap);
            }
    /********************************************************************************************/        

        });
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


const validateForm = () => {
    return false;
};