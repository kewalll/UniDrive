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
  var z = y[0]+','+y[1];
  console.log(y);
  new mapboxgl.Marker().setLngLat(e.result.geometry.coordinates).addTo(map);

  const response = await createLocation({ location: y });

  // Store the result somewhere, e.g., in a global variable or send to a server
});

document.getElementById("geocoder").appendChild(geocoder.onAdd(map));