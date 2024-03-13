const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const CyclicDb = require("@cyclic.sh/dynamodb");
const logger = require('../../middleware/logger');

const db = CyclicDb("periwinkle-termite-cuffCyclicDB");
const activitiesCollection = db.collection("activities"); // Assuming a dedicated collection for activities

// Function to get activity by ID
async function getActivity(id) {
  try {
    const activity = await activitiesCollection.get(id);
    return activity;
  } catch (err) {
    console.error("Error fetching activity:", err);
    throw err;
  }
}

// Function to create a new activity
async function createActivity(activity) {
  try {
    activity.id = uuid.v4(); // Generate unique ID
    res = await activitiesCollection.set(activity.id, activity);
    return res;
  } catch (err) {
    console.error("Error creating activity:", err);
    throw err;
  }
}

// Function to update an activity
async function updateActivity(id, updates) {
  try {
    const activity = await getActivity(id);
    if (!activity) {
      throw new Error("Activity not found");
    }
    await activitiesCollection.set(id, updates);
  } catch (err) {
    console.error("Error updating activity:", err);
    throw err;
  }
}

// Route to create a new activity
router.post('/activities', async (req, res) => {
  const { name, type, location, link } = req.body; // Destructure required properties from request body

  if (!name || !type) {
    return res.status(400).json({ msg: "Missing required fields: name and type" });
  }

  try {
    const newActivity = await createActivity({ name, type, location, link, pinned: false, memberCount: 0, members: [] });
    res.status(201).json(newActivity);
  } catch (err) {
    res.status(500).json({ msg: "Error creating activity", error: err.message });
  }
});

// Route to pin an activity
router.post('/activities/:id/pin', async (req, res) => {
  const { id } = req.params;

  try {
    await updateActivity(id, { pinned: true });
    res.status(200).json({ msg: "Activity pinned" });
  } catch (err) {
    if (err.message === "Activity not found") {
      return res.status(404).json({ msg: "Activity not found" });
    }
    res.status(500).json({ msg: "Error pinning activity", error: err.message });
  }
});

// Route to update activity name and unpin
router.put('/activities/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body; // Allow optional name update

  try {
    const updates = {};
    if (name) {
      updates.name = name;
    }
    updates.pinned = false; // Unpin by default
    await updateActivity(id, updates);
    res.status(200).json({ msg: "Activity updated" });
  } catch (err) {
    if (err.message === "Activity not found") {
      return res.status(404).json({ msg: "Activity not found" });
    }
    res.status(500).json({ msg: "Error updating activity", error: err.message });
  }
});

// Route to delete an activity
router.delete('/activities/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await getActivity(id); // Check if activity exists before deleting
    await activitiesCollection.delete(id);
    res.status(204).json(); // No Content on successful deletion
  } catch (err) {
    if (err.message === "Activity not found") {
      return res.status(404).json({ msg: "Activity not found" });
    }
    res.status(500).json({ msg: "Error deleting activity", error: err.message });
  }
});


// // Member object structure
// const member = {
//   uuid: req.body.memberUuid,
//   name: req.body.memberName,
// };

// Route to create member in activity
router.post('/activities/:id/members', async (req, res) => {
  const { id } = req.params;
  const { memberName } = req.body; // Destructure member details

  if (!memberName) {
    return res.status(400).json({ msg: "Missing required fields: memberUuid and memberName" });
  }

  try {
    const activity = await getActivity(id);
    if (!activity) {
      return res.status(404).json({ msg: "Activity not found" });
    }
    const updates = {}
    updates.members = activity.props.members

    const newMember = { uuid: uuid.v4(), name: memberName };
    updates.members.push(newMember);
    updates.memberCount = updates.members.length; // Update member count

    await updateActivity(id, updates); // Update activity with new member list and count
    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ msg: "Error adding member to activity", error: err.message });
  }
});

// Route to get list of activities with member count
router.get('/activities', async (req, res) => {
  try {
    const activities = await activitiesCollection.filter(); // Assuming 'filer' is the method to get all items
    // const activitiesWithMemberCount = activities.results.map(activity => ({
    //   ...activity,
    //   memberCount: activity.members ? activity.members.length : 0, // Handle potential missing 'members' property
    // }));
    // res.json(activitiesWithMemberCount);
    res.json(activities.results)
  } catch (err) {
    res.status(500).json({ msg: "Error retrieving activities", error: err.message });
  }
});

// Route to get list of members in activity
router.get('/activities/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await getActivity(id);
    if (!activity) {
      return res.status(404).json({ msg: "Activity not found" });
    }
    res.json(activity.props);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching members from activity", error: err.message });
  }
});

// Route to delete member by UUID
router.delete('/activities/:id/members/:memberUuid', async (req, res) => {
  const { id, memberUuid } = req.params;

  try {
    const activity = await getActivity(id);
    if (!activity) {
      return res.status(404).json({ msg: "Activity not found" });
    }

    const memberIndex = activity.props.members.findIndex(m => m.uuid === memberUuid);
    if (memberIndex === -1) {
      return res.status(404).json({ msg: "Member not found in this activity" });
    }

    const updates = {}
    updates.members = activity.props.members

    updates.members.splice(memberIndex, 1); // Remove member from the array
    updates.memberCount = updates.members.length; // Update member count

    await updateActivity(id, updates); // Update activity with modified member list and count
    res.status(204).json(); // No Content on successful deletion
  } catch (err) {
    res.status(500).json({ msg: "Error deleting member from activity", error: err.message });
  }
});


// SCHEMA
//
// {
//   "id": "123e4567-e89b-12d3-a456-426614174000",
//   "name": "Team Project",
//   "type": "work",
//   "pinned": true,
//   "memberCount": 2,
//   "members": [
//     {
//       "uuid": "789a01b2-c3d4-4e5f-890a-123456789012",
//       "name": "John Doe"
//     },
//     {
//       "uuid": "fedcba09-8765-4321-abcd-ef0123456789",
//       "name": "Jane Smith"
//     }
//   ]
// }


module.exports = router;