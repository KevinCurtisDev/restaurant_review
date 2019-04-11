# Restaurant Review
This is the 7th project in the openclassrooms Front end developer bachelor diploma. The project brief is as follows:

* Show restaurants on a map based on the user's GPS coordinates.
* Restaurants that are currently visible on the map should be displayed in list form on the side of the map.
* You will see the average reviews of each restaurant (ranging from 1 to 5 stars).
* When the user clicks on a restaurant, the list of reviews should be shown. Also show the Google Street View photo via the corresponding API.
* A filter tool allows the display of restaurants that have between X and Y stars. The map should be updated in real-time to show the corresponding restaurants.
* Add a review about an existing restaurant.
* Add a restaurant by clicking on a specific place on the map.
* Display additional restaurants and reviews on the map using the google places API.

### Note
I used LeafletJS as a free alternative to google maps,  and Zomato API as an alternative to google places and google street view.

View and try out the web app here: [Restaurant Review Web App](https://the-masta-blasta.github.io/restaurant_review/)



## UX
This web application is particularly suited to being implemented as a single page web app. This makes it simple for the user to navigate around the app while having full control of what they are seeing. 

### User stories: 
I want to... 
* ..see restaurants near my current location. 
* ..see reviews of nearby restaurants.
* ..add my own review to listed restaurants.
* ..add a new restaurant to the map and add reviews to it.
* ..search for other locations and see restaurants at that location.
* ..filter results based on ratings.


## Features
search bar
filter
map
listing of restaurants


## Technologies used
* HTML5
* CSS3
* Vanilla JavaScript
* Zomato API (for information on restaurants)
* LeafletJS (To build the map)
* Mapquest API (for geoforwarding)

## Testing
Manual testing was carried out, using live server in Visual Studio, applying the listed user stories above. 

## Deployment
The app was deployed on github pages and can be viewed at the following link: [Restaurant Review Web App](https://the-masta-blasta.github.io/restaurant_review/)

## Further enhancements
Connecting the app to a backend in order to maintain data persistence for the added restaurants. Implementing a service worker to make load times faster and for offline viewing, I feel, would be a nice enhancement.