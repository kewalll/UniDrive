// mapboxgl.accessToken =
//   "pk.eyJ1Ijoia2V3YWwyMTA1IiwiYSI6ImNsdTA1NXoyMTA3aWkyaW13OHNqZ2h4bDQifQ.JqrilNyDxi9flLHowJlH3w";

// const createLocation2 = async (data) => {
//   console.log("data: " + JSON.stringify(data));
//   try {
//     const options = {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     };

//     console.log("options: " + JSON.stringify(options));
//     const response = await fetch("/storeLocation2", options);

//     // console.log("response: " + response);

//     return await response.json();
//   } catch (error) {
//     console.error("Error:", error);
//   }
// };

// const map = new mapboxgl.Map({
//   container: "map",
//   style: "mapbox://styles/mapbox/streets-v12",
//   center: [73.8567, 18.5204],
//   zoom: 11,
// });

// var geocoder = new MapboxGeocoder({
//   accessToken: mapboxgl.accessToken,
//   mapboxgl: mapboxgl,
// });

// geocoder.on("result", async function (e) {
//   // e.preventDefault();
//   x = e.result;
//   y = x.center;
//   z = y[0]+','+y[1];
//   console.log(z);
//   new mapboxgl.Marker().setLngLat(e.result.geometry.coordinates).addTo(map);

//   const response = await createLocation2({ location2: y });
//   fetch(
//     "https://api.mapbox.com/directions/v5/mapbox/driving/" +
//       z +
//       ";73.7279,18.5413?geometries=geojson&access_token=pk.eyJ1Ijoia2V3YWwyMTA1IiwiYSI6ImNsdTA1NXoyMTA3aWkyaW13OHNqZ2h4bDQifQ.JqrilNyDxi9flLHowJlH3w"
//   )
//     .then((response) => response.json())
//     .then((data) => {
//       const distance = data.routes[0].distance / 1000; // Converting meters to kilometers
//       console.log("Distance (in km):", distance);

//       const fare = 20 + (distance - 3) * 5; // Assuming Rs. 5 per kilometer after the initial 3 kilometers
//       console.log("Fare: Rs.", fare);
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//     });

//   // Store the result somewhere, e.g., in a global variable or send to a server
// });

// document.getElementById("geocoder").appendChild(geocoder.onAdd(map));

 let location2;
mapboxgl.accessToken =
  "pk.eyJ1Ijoia2V3YWwyMTA1IiwiYSI6ImNsdTA1NXoyMTA3aWkyaW13OHNqZ2h4bDQifQ.JqrilNyDxi9flLHowJlH3w";

const createLocation2 = async (data) => {
  console.log("data: " + JSON.stringify(data));
  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    console.log("options: " + JSON.stringify(options));
    const response = await fetch("/storeLocation2", options);
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
  }
};

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [73.8567, 18.5204],
  zoom: 11,
});

var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
});

function sendLocationToServer(location2) {
  fetch("/processLocation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ location2 }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("location data sentttttt:", data);
    })
    .catch((error) => {
      console.error("erorrrr:", error);
    });
}
// fetch('/getLocation2')
//   .then(response => response.json())
//   .then(data => {
//     const location2 = data.location2;
//     // Now you have retrieved location2 from the server
//     // You can use it as needed, for example, pass it to sendLocationToServer()
//     sendLocationToServer(location2);
//   })
//   .catch(error => {
//     console.error('Error fetching location2:', error);
//   });

// Function to update location2

geocoder.on("result", function (e) {
  // Update the map with the searched location
  const marker = new mapboxgl.Marker()
    .setLngLat(e.result.geometry.coordinates)
    .addTo(map);

  // // Store the location data in a variable
  // const location2Data = {
  //   location2: e.result.center,
  //   marker: marker
  // };
  location2 = e.result.center;
  

  // Attach a click event listener to the "request" button
  document
    .getElementById("request-button")
    .addEventListener("click", async function () {
      // Save the location to the database when the "Publish" button is clicked
      sendLocationToServer(location2);

      // const { location2 } = location2Data;
      console.log("Location coordinates:", location2);
      // console.log("Location published:", response);

      marker.remove();
    });
});
// export {location2};

document.getElementById("geocoder").appendChild(geocoder.onAdd(map));


// const map = new mapboxgl.Map({
//   container: "map",
//   style: "mapbox://styles/mapbox/streets-v12",
//   center: [73.8567, 18.5204],
//   zoom: 11,
// });

// var geocoder = new MapboxGeocoder({
//   accessToken: mapboxgl.accessToken,
//   mapboxgl: mapboxgl,
// });

// // Define location2 variable in a scope accessible to both geocoder event and updateLocation function

// let location2 = null;
// // Function to dispatch locationChanged event
// function dispatchLocationChangedEvent(location) {
//   const locationChangedEvent = new CustomEvent('locationChanged', { detail: { location } });
//   window.dispatchEvent(locationChangedEvent);
// }

// // Function to update location2 and dispatch event
// function updateLocation(location) {
//   location2 = location;
//   dispatchLocationChangedEvent(location2);
// }

// geocoder.on("result", function (e) {
//   const marker = new mapboxgl.Marker()
//     .setLngLat(e.result.geometry.coordinates)
//     .addTo(map);

//   location2 = e.result.center;
//   updateLocation(location2);

//   document.getElementById("request-button").addEventListener("click", async function () {
//     // Handle button click
//     console.log("Location coordinates:", location2);
//     marker.remove();
//   });
// });

// document.getElementById("geocoder").appendChild(geocoder.onAdd(map));
