const express = require('express');
const router = express.Router();
const users = require('../../Users');
const uuid = require('uuid');

// GET all users
router.get('/', (req, res) => {
    res.json(users);
})

router.get('/:id', (req, res) => {
    let found = users.some(user => user.id === parseInt(req.params.id))
    if (found) {
        res.json(users.filter(user => user.id === parseInt(req.params.id)));
    } else {
        res.status(400).json({msg:`No users with the id of ${req.params.id}`})
    }
})

// Create user
router.post('/',(req,res)=>{
    const newUser = {
        id: uuid.v4(),
        name: req.body.name,
        time: req.body.time
    }
    if (!newUser.name || !newUser.time){
        return res.status(400).json({msg:`missing name or time`});
    }
    users.push(newUser);
    res.json(users);

})

router.delete('/:id', (req, res) => {
    let found = users.some(user => user.id === parseInt(req.params.id));
    if (found) {
        res.json({
            msg: 'User Deleted',
            users: users.filter(user=> user.id !== parseInt(req.params.id))
        })
    }else{
        res.status(400).json({ msg: `Dont have that user`});
    }
})

module.exports = router;