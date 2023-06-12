const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const verifyToken = require('./middlewares/jwt.middleare');

require('dotenv').config();

const port = process.env.PORT

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// Define a schema for the user model
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    maritalStatus: String,
    age: Number,
    gender: String,
    mobileNumber: String
});

// Create a User model based on the schema
const User = mongoose.model('User', userSchema);

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());
app.use('/api/profile', verifyToken);
// Route to handle user registration
app.post('/api/register', async (req, res) => {
    try {
        // Create a new user based on the submitted data
        const newUser = new User(req.body);

        // Save the user to the database
        await newUser.save();

        res.status(200).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'An error occurred during registration' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found', });
        }

        // Compare the provided password with the stored password
        const isPasswordValid = password === user.password;

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const token = jwt.sign(user.toJSON(), process.env.JWT_PRIVATE_KEY, { expiresIn: '1h' });
        res.status(200).json({ token, message: "Logged In Successfully" });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/api/profile', async (req, res) => {
    // Get the user ID from the authenticated user or session
    const _id = req.user._id;

    // Get the updated profile data from the request body
    const updatedProfile = req.body;
    
    // Perform the necessary actions to update the profile in your database
    // For example, you can use a user model or ORM to update the user's profile
    const user = await User.findById({ _id })
    // Update the user's profile with the new data
    user.firstName = updatedProfile.firstName;
    user.lastName = updatedProfile.lastName;
    user.email = updatedProfile.email;
    user.password = updatedProfile.password;
    // Update other profile fields as needed

    // Save the updated user profile
    const updatedUser = await user.save()

    // Return a success message or the updated user profile
    res.json({ message: 'Profile updated successfully', profile: updatedUser });
});

app.get('/api/profile', async (req, res) => {
    // Get the user ID from the authenticated user or session
    const _id = req.user._id;

    // Fetch the user's profile from the database
    const user = await User.findById({ _id })
    if (!user) {
        // User not found in the database
        return res.status(404).json({ message: 'User not found' });
    }

    // Return the user's profile
    res.json(user);
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
