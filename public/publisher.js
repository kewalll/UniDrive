// mapboxgl.accessToken =
//   "pk.eyJ1Ijoia2V3YWwyMTA1IiwiYSI6ImNsdTA1NXoyMTA3aWkyaW13OHNqZ2h4bDQifQ.JqrilNyDxi9flLHowJlH3w";

// const createLocation = async (data) => {
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
//     const response = await fetch("/storeLocation", options);

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
//   var z = y[0]+','+y[1];
//   console.log(y);
//   new mapboxgl.Marker().setLngLat(e.result.geometry.coordinates).addTo(map);

//   const response = await createLocation({ location: y });

//   // Store the result somewhere, e.g., in a global variable or send to a server
// });

// document.getElementById("geocoder").appendChild(geocoder.onAdd(map));
mapboxgl.accessToken =
  "pk.eyJ1Ijoia2V3YWwyMTA1IiwiYSI6ImNsdTA1NXoyMTA3aWkyaW13OHNqZ2h4bDQifQ.JqrilNyDxi9flLHowJlH3w";

const createLocation = async (data) => {
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
    const response = await fetch("/storeLocation", options);
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

geocoder.on("result", function (e) {
  // Update the map with the searched location
  const marker = new mapboxgl.Marker().setLngLat(e.result.geometry.coordinates).addTo(map);

  // Store the location data in a variable
  const locationData = {
    location: e.result.center,
    marker: marker
  };

  // Attach a click event listener to the "Publish" button
  document.getElementById("publish-button").addEventListener("click", async function () {
    // Save the location to the database when the "Publish" button is clicked
    const departTime = document.getElementById("map-button2").value;
    const availableSeats = document.getElementById("map-button1").value;
    const response = await createLocation({ location: locationData.location ,
      departTime: departTime,
      availableSeats: availableSeats});
    console.log("Location published:", response);

    // Remove the marker from the map after publishing
    locationData.marker.remove();
  });
});

document.getElementById("geocoder").appendChild(geocoder.onAdd(map));