const express = require('express');
const router = express.Router();
// const users = require('../../Users');
const uuid = require('uuid');
const CyclicDb = require("@cyclic.sh/dynamodb");
const db = CyclicDb("periwinkle-termite-cuffCyclicDB");
const latest = db.collection("latest");

// Function to get the latest collection name
async function getLatestCollectionName() {
    try {
        const lt = await latest.latest(); // Assuming 'latest()' returns the latest collection info
        return lt;
    } catch (err) {
        console.error("Error fetching latest collection name:", err);
        throw err;
    }
}

async function updateLatestCollectionName(req) {
    try {
        // Assuming 'set' method is used to update an item in the collection
        // await latest.set(uuid.v4(), { name: newCollectionName });
        await latest.set(req.body.name, req.body);
    } catch (err) {
        console.error("Error updating latest collection name:", err);
        throw err;
    }
}

// Route to create a new latest name
router.post('/createLatestName', async (req, res) => {
    // const newCollectionName = req.body.name;

    try {
        await updateLatestCollectionName(req);
        res.status(201).json({ msg: "Latest collection name created", name: req.body.name });
    } catch (err) {
        res.status(500).json({ msg: "Error creating latest collection name", error: err });
    }
});

// GET all latest name
router.get('/LatestName', async (req, res) => {
    try {
        const LatestName = await getLatestCollectionName()
        res.json(LatestName);
    } catch (err) {
        res.status(500).json({ msg: "Error retrieving LatestName", error: err, });
    }
});

// GET all latest name
router.get('/LatestNames', async (req, res) => {
    try {
        const allUsers = await latest.filter(); // Assuming 'scan' is the method to get all items
        res.json(allUsers);
    } catch (err) {
        const latestCollectionName = await getLatestCollectionName();
        res.status(500).json({ msg: "Error retrieving users", error: err, latestCollectionName });
    }
});

// GET all users
router.get('/', async (req, res) => {
    try {
        const latestCollectionName = await getLatestCollectionName();
        const users = db.collection(latestCollectionName.key);
        const allUsers = await users.filter(); // Assuming 'scan' is the method to get all items
        res.json(allUsers);
    } catch (err) {
        const latestCollectionName = await getLatestCollectionName();
        res.status(500).json({ msg: "Error retrieving users", error: err, latestCollectionName });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const users = db.collection(req.params.id);
        const allUsers = await users.filter(); // Assuming 'scan' is the method to get all items
        res.json(allUsers);
    } catch (err) {
        const latestCollectionName = await getLatestCollectionName();
        res.status(500).json({ msg: "Error retrieving users", error: err, latestCollectionName });
    }
});

// Create user
router.post('/', async (req, res) => {
    const latestCollectionName = await getLatestCollectionName();
    const users = db.collection(latestCollectionName.key);
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
        const latestCollectionName = await getLatestCollectionName();
        const users = db.collection(latestCollectionName.key);
        await users.delete(req.params.id); // Assuming 'delete' is the method to delete an item by ID
        res.json({ msg: 'User deleted' });
    } catch (err) {
        res.status(500).json({ msg: "Error deleting user", error: err });
    }
});

module.exports = router;