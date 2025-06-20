const User =  require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    console.log("req", req)
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if(!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
            message: 'Invalid email or password'
        })
    }

    const token = jwt.sign(
        {id: user._id},
        process.env.JWT_SECRET,
        {expiresIn: '1d'}
    )
    
    res.json({ token });
};

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully.' });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated or token is invalid.' });
        }

        const user = await User.findById(req.user.id).select('name'); 

        if (!user) {
            return res.status( 404).json({ message: 'User not found.' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error while fetching user details.' });
    }
};

exports.logout = (req, res) => {
    res.status(200).json({
        message: 'Logout successful. Please ensure the token is cleared on the client-side.'
    });
};