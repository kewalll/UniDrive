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

    // console.log("response: " + response);

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
  // e.preventDefault();
  x = e.result;
  y = x.center;
  z = y[0]+','+y[1];
  console.log(z);
  new mapboxgl.Marker().setLngLat(e.result.geometry.coordinates).addTo(map);

  const response = await createLocation2({ location2: y });
  fetch(
    "https://api.mapbox.com/directions/v5/mapbox/driving/" +
      z +
      ";73.7279,18.5413?geometries=geojson&access_token=pk.eyJ1Ijoia2V3YWwyMTA1IiwiYSI6ImNsdTA1NXoyMTA3aWkyaW13OHNqZ2h4bDQifQ.JqrilNyDxi9flLHowJlH3w"
  )
    .then((response) => response.json())
    .then((data) => {
      const distance = data.routes[0].distance / 1000; // Converting meters to kilometers
      console.log("Distance (in km):", distance);

      const fare = 20 + (distance - 3) * 5; // Assuming Rs. 5 per kilometer after the initial 3 kilometers
      console.log("Fare: Rs.", fare);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  // Store the result somewhere, e.g., in a global variable or send to a server
});

document.getElementById("geocoder").appendChild(geocoder.onAdd(map));