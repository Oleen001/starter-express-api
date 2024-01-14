const express = require('express');
const router = express.Router();
// const users = require('../../Users');
const uuid = require('uuid');
const CyclicDb = require("@cyclic.sh/dynamodb");
const db = CyclicDb("periwinkle-termite-cuffCyclicDB");

const users = db.collection("223");

// GET all users
router.get('/', async (req, res) => {

    try {
        const allUsers = await users.filter(); // Assuming 'scan' is the method to get all items
        res.json(allUsers);
    } catch (err) {
        res.status(500).json({ msg: "Error retrieving users", error: err });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await users.get(req.params.id); // Assuming 'get' is the method to get an item by ID
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ msg: `No user with the id of ${req.params.id}` });
        }
    } catch (err) {
        res.status(500).json({ msg: "Error retrieving user", error: err });
    }
});

// Create user
router.post('/', async (req, res) => {
    const newUser = {
        id: uuid.v4(), // Generate unique ID
        name: req.body.name,
        ...req.body // Spread operator to add other user properties from the request body
    };

    try {
        await users.set(newUser.id, newUser); // Assuming 'put' is the method to add an item
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ msg: "Error creating user", error: err });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        await users.delete(req.params.id); // Assuming 'delete' is the method to delete an item by ID
        res.json({ msg: 'User deleted' });
    } catch (err) {
        res.status(500).json({ msg: "Error deleting user", error: err });
    }
});

module.exports = router;