// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const turf = require("@turf/turf");
const stripe = require('stripe')('sk_test_51OwItoSC9D6ccGsCzVCmIcGkl2f60PXIx8reeNluGxzJ9hJSOOZLp32Hl0ASHlQq0VtWptIxYaYYzch13ow8rZXy00AgQfCG6r');

dotenv.config();
const bcrypt = require("bcrypt");
// Create Express app
const app = express();

app.use(express.json());
// Set up view engine
app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", path.join(__dirname, "../views"));
app.use("/public", express.static(path.join(__dirname, "../public")));

// Connect to MongoDB (replace 'your_database_url' with your actual MongoDB Atlas URL)
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Define user schema
const User = mongoose.model("User", {
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  gender: String,
});

// Define the Location schema

// Create a Mongoose model for the new collection

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    // If user session exists, proceed to the next middleware
    return next();
  } else {
    // If user session does not exist, redirect to the landing page
    res.redirect("/");
  }
}

// const LocationSchema = new mongoose.Schema({
//   coordinates: {
//     type: String,
//     required: true,
//   },
// });
// const LocationSchema = new mongoose.Schema({
//   coordinates: {
//     type: String,
//     required: true
//   },
//   user: {
//     type: String,
//     required: true
//   }
// });
const LocationSchema = new mongoose.Schema({
  coordinates: {
    type: String,
    required: true,
  },
  user: {
    type: String, // Corrected type to represent email as a string
    ref: "User", // Referencing the User model
    required: true,
  },
});
const Location2Schema = new mongoose.Schema({
  coordinates: {
    type: String,
    required: true,
  },
  user: {
    type: String, // Corrected type to represent email as a string
    ref: "User", // Referencing the User model
    required: true,
  },
});

// Define the Location model
const Location = mongoose.model("Location", LocationSchema);
const Location2 = mongoose.model("Location2", Location2Schema);

// Assuming you've already connected to MongoDB using mongoose, as shown in your previous code

// POST endpoint to store location
// app.post("/storeLocation", isLoggedIn, async (req, res) => {
//   try {
//     const { location } = req.body;

//     // Create a new Location document using the Location model
//     const newLocation = new Location({ coordinates: location.toString() });
//     await newLocation.save();
//     res.sendStatus(200); // Send a success response
//   } catch (error) {
//     console.error("Error storing location:", error);
//     res.sendStatus(500); // Send an error response
//   }
// });
// This is your test secret API key.

// const express = require('express');
// const app = express();
// app.use(express.static('public'));



app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: 'price_1OwOBdSC9D6ccGsCE7MIxbZF',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url:' ${YOUR_DOMAIN}//success',
    cancel_url: '${YOUR_DOMAIN}//cancel',
  });

  res.redirect(303, session.url);
});


app.post("/storeLocation", isLoggedIn, async (req, res) => {
  try {
    const { location } = req.body;

    // Retrieve the logged-in user's details from the session
    const loggedInUser = req.session.user;

    // Create a new Location document associated with the logged-in user
    const newLocation = new Location({
      coordinates: location.toString(),
      user: loggedInUser.email,
      // Assigning the ObjectId of the logged-in user
    });

    await newLocation.save();
    res.sendStatus(200); // Send a success response
  } catch (error) {
    console.error("Error storing location:", error);
    res.sendStatus(500); // Send an error response

  }
});
app.post("/storeLocation2", isLoggedIn, async (req, res) => {
  try {
    const { location2 } = req.body;

    // Retrieve the logged-in user's details from the session
    const loggedInUser = req.session.user;

    // Create a new Location document associated with the logged-in user
    const newLocation2 = new Location2({
      coordinates: location2.toString(),
      user: loggedInUser.email,
      // Assigning the ObjectId of the logged-in user
    });
    

    await newLocation2.save();
    res.sendStatus(200); // Send a success response
  } catch (error) {
    console.error("Error storing location2:", error);
    res.sendStatus(500); // Send an error response
  }
});
 // Import Turf.js for distance calculation

// Route to calculate distances between Location2 and all Location data for the current user
app.get("/calculateDistances", isLoggedIn, async (req, res) => {
  try {
    // Retrieve the logged-in user's details from the session
    const loggedInUser = req.session.user;

    // Find Location2 data for the current user
    const location2 = await Location2.findOne({ user: loggedInUser.email });

    if (!location2) {
      return res.status(404).json({ error: "Location2 not found" });
    }

    // Find all Location data for the current user
    const allLocations = await Location.find({ user: loggedInUser.email });

    // Array to store distances
    const distances = [];

    // Calculate distances between Location2 and each Location
    allLocations.forEach((location) => {
      const locationPoint = turf.point(location.coordinates.split(",").map(Number));
      const location2Point = turf.point(location2.coordinates.split(",").map(Number));
      const distance = turf.distance(locationPoint, location2Point, { units: "miles" });
      distances.push({
        location: location._id,
        location2: location2._id,
        distance: distance.toFixed(2), // Round distance to 2 decimal places
      });
    });

    // Log distances to the console
    console.log(`Distances for Location2 ${location2._id}:`);
    distances.forEach((distance) => {
      console.log(`Location ${distance.location} to Location2 ${distance.location2}: ${distance.distance} miles`);
    });

    // Send response with distances
    res.status(200).json(distances);
  } catch (error) {
    console.error("Error calculating distances:", error);
    res.status(500).json({ error: "An error occurred while calculating distances" });
  }
});


// Routes

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/landing", (req, res) => {
  res.render("landing");
});
// app.get("/account", (req, res) => {
//   res.render("account");
// });
app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/publisher", (req, res) => {
  res.render("publisher");
});
app.get("/passenger", (req, res) => {
  res.render("passenger");
});
app.get("/calculatedistance", (req, res) => {
  res.render("calculatedistance");
});
app.get("/cancel", (req, res) => {
  res.render("cancel");
});
app.get("/success", (req, res) => {
  res.render("success");
});
app.get("/checkout", (req, res) => {
  res.render("checkout");
});
app.get("/account", isLoggedIn, async (req, res) => {
  try {
    // Fetch user data from the session
    const user = req.session.user;

    // If user data is found in the session, fetch user data from the database using the user's ID
    if (user) {
      // Fetch user data from the database based on the user's ID from the session
      const userData = await User.findById(user._id);

      if (userData) {
        res.render("account", { user: userData });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } else {
      return res.status(404).json({ error: "User not found in session" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching user profile" });
  }
});
// POST endpoint to store location
// app.post("/storeLocation", isLoggedIn, async (req, res) => {
//   try {
//     const { location } = req.body;

//     // Retrieve the logged-in user's details from the session
//     const loggedInUser = req.session.user;

//     // Create a new Location document associated with the logged-in user
//     const newLocation = new Location({
//       coordinates: location.toString(),
//       user: loggedInUser._id, // Assigning the ObjectId of the logged-in user
//     });

//     await newLocation.save();

//     // Fetch the associated user's email
//     const userWithEmail = await User.findById(loggedInUser._id);
//     const userEmail = userWithEmail.email;

//     // Send response with location and email
//     res
//       .status(200)
//       .json({ location: newLocation.coordinates, email: userEmail });
//   } catch (error) {
//     console.error("Error storing location:", error);
//     res.sendStatus(500); // Send an error response
//   }
// });

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/publishernext", (req, res) => {
  res.render("publishernext");
});
// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;

//     try {
//       console.log("Login attempt with email:", email);

//       // Check if email and password are provided
//       if (!email || !password) {
//         console.log("Email or password missing");
//         return res.status(400).send("Email and password are mandatory");
//       }

//       // Find the user by email
//       const user = await User.findOne({ email });

//       // Check if user exists
//       if (!user) {
//         console.log("User not found");
//         return res.redirect("/login"); // Redirect to login page if user doesn't exist
//       }

//       // Compare the provided password with the hashed password
//       const isPasswordValid = await bcrypt.compare(password, user.password);

//       // Check if password is valid
//       if (!isPasswordValid) {
//         console.log("Invalid password");
//         return res.status(401).send("Invalid credentials");
//       }

//       // Store user data in session
//       req.session.user = user;

//       // Redirect to home page
//       console.log("User logged in successfully");
//       res.redirect("/home");

//     } catch (error) {
//       console.error("Login error:", error);
//       return res.status(500).send("An error occurred during login.");
//     }
//   });

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await User.findOne({ email });

      if (user) {
        // Compare the provided password with the hashed password stored in the database
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (isPasswordMatch) {
          req.session.user = user; // Store user data in session
          res.redirect("/home");
        } else {
          res.redirect("/login");
        }
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).send("An error occurred while processing your request");
    }
  } else {
    res.render("/login", {
      error: "Email and password are mandatory",
    });
  }
});

app.post("/signup", async (req, res) => {
  const { firstname, lastname, email, password, gender } = req.body;
  if (!email || !password) {
    return res.render("signup", {
      error: "Email and password are mandatory",
    });
  }

  const emailString = Array.isArray(email) ? email.join("") : email;
  const passwordString = Array.isArray(password) ? password.join("") : password;
  const genderString = Array.isArray(gender) ? gender.join("") : gender;

  // Hash the password
  const hashedPassword = await bcrypt.hash(passwordString, 10); // 10 is the salt rounds

  try {
    const user = new User({
      firstname,
      lastname,
      email: emailString,
      password: hashedPassword,
      gender: genderString, // Store hashed password in the database
    });

    await user.save();

    // Store user data in session
    req.session.user = user;

    // Redirect to the home page after successful signup
    res.redirect("/home"); // Corrected URL
  } catch (error) {
    // Handle signup errors
    console.error("Signup error:", error);
    return res.render("error", {
      error: "An error occurred. Please try again later.",
    });
  }
});
// app.get("/account", isLoggedIn, async (req, res) => {
//   try {
//     // Fetch user data from the session
//     const user = req.session.user;

//     // If user data is found in the session, render the account.ejs template with user data
//     if (user) {
//       res.render("account", { user });
//     } else {
//       return res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     return res
//       .status(500)
//       .json({ error: "An error occurred while fetching user profile" });
//   }
// });

// app.get("/account/:email", async (req, res) => {
//   try {
//     const userEmail = req.params.email;

//     // Fetch user data from the database based on the provided email
//     const user = await User.findOne({ email: userEmail });

//     // If user data is found, render the account.ejs template with user data
//     if (user) {
//       res.render("account", { user });
//     } else {
//       return res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     return res
//       .status(500)
//       .json({ error: "An error occurred while fetching user profile" });
//   }
// });

app.get("/", (req, res) => {
  res.render("landing"); // Render the 'login.ejs' template
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));