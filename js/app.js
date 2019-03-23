//get the html node that will contain the javascript generated html
const restaurantsList = document.querySelector("#restaurant-list");

//list of restaurants and reviews
let reviews = [
    {
        "restaurantName": "Bronco",
        "address": "39 Rue des Petites Écuries, 75010 Paris",
        "lat": 48.8737815,
        "long": 2.3501649,
        "ratings": [
            {
                "stars": 4,
                "comment": "Great! But not many veggie options."
            },
            {
                "stars": 5,
                "comment": "My favorite restaurant!"
            }
        ]
    },
    {
        "restaurantName": "Babalou",
        "address": "4 Rue Lamarck, 75018 Paris",
        "lat": 48.8865035,
        "long": 2.3442197,
        "ratings": [
            {
                "stars": 5,
                "comment": "Tiny pizzeria next to Sacre Coeur!"
            },
            {
                "stars": 3,
                "comment": "Meh, it was fine."
            }
        ]
    }
]

// create the restaurant list html
//loop through the review array and create a list item block for each object
for (let i = 0; i <= reviews.length; i++) {
    let restaurantDetails = document.createElement("li");
    restaurantDetails.classList.add("review");

    let restaurantTitle = document.createElement("p");
    restaurantTitle.innerHTML = reviews[i].restaurantName;

    let restaurantAddress = document.createElement("p");
    restaurantAddress.innerHTML = reviews[i].address;

    restaurantTitle.append(restaurantAddress);
    restaurantDetails.append(restaurantTitle);
    restaurantsList.append(restaurantDetails);

//loop through the reviews of each restaurant object and create the corresponding html
    for (let j = 0; j <= reviews[i].ratings.length - 1; j++) {
        console.log(reviews[i].ratings.length);
        let restaurantReview = document.createElement("p");
        restaurantReview.innerHTML = `Rating: ${reviews[i].ratings[j].stars} Review: ${reviews[i].ratings[j].comment}`;
        restaurantAddress.append(restaurantReview);
    }

}