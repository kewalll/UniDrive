mapboxgl.accessToken = "pk.eyJ1Ijoia2V3YWwyMTA1IiwiYSI6ImNsdTA1NXoyMTA3aWkyaW13OHNqZ2h4bDQifQ.JqrilNyDxi9flLHowJlH3w";

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

geocoder.on("result", async function (e) {
  // Update the map with the searched location
  const marker = new mapboxgl.Marker().setLngLat(e.result.geometry.coordinates).addTo(map);

  // Store the location data in a variable
  const location2Data = {
    location2: e.result.center,
    marker: marker
  };

  // Attach a click event listener to the "request" button
  document.getElementById("request-button").addEventListener("click", async function () {
    try {
      // Save the location to the database when the "request" button is clicked
      const response = await createLocation2({
        location2: location2Data.location2,
      });
      console.log("Location published:", response);

      // Remove the marker from the map after publishing
      location2Data.marker.remove();

      // Fetch the saved location coordinates directly
      const fetchResponse = await fetch("/fetchLocationCoordinates");
      const fetchedLocation = await fetchResponse.json();
      console.log("Fetched Location:", fetchedLocation);
    } catch (error) {
      console.error("Error:", error);
    }
  });
});

document.getElementById("geocoder").appendChild(geocoder.onAdd(map));
