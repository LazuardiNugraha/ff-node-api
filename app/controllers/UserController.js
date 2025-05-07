const { User } = require('../models/User');

module.exports = {
  async index(req, res) {
    try {
      const users = await User.findAll();
      console.log(users)
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async store(req, res) {
    try {
      const { name, email, password } = req.body;
      const user = await User.create({ name, email, password });
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
};

// This file defines the UserController which handles the logic for user-related operations. It includes methods to fetch all users and create a new user.
// The controller interacts with the User model to perform database operations.
// The index method retrieves all users from the database and returns them in the response.