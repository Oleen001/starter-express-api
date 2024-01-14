const express = require('express');

const logger = require('./middleware/logger');

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/api/users', require('./routes/api/users'))

// Init Middleware
app.use(logger);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`server is running on port: ${PORT}`));