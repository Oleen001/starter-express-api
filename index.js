const express = require('express');

const logger = require('./middleware/logger');

const app = express();

app.use(function(req, res, next) {
    // res.setHeader('Access-Control-Allow-Origin', 'https://oleen-activity.netlify.app/');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(express.json());
app.use(express.urlencoded({extended: false}));

//users for old version
app.use('/api/users', require('./routes/api/users'))

app.use('/api', require('./routes/api/activities'))


app.use(logger);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`server is running on port: ${PORT}`));