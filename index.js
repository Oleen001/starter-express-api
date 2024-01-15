const express = require('express');

const logger = require('./middleware/logger');

// const cors = require('cors');

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/api/users', require('./routes/api/users'))

// Init Middleware
app.use((req,res, next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// app.use(cors({
//     origin:'https://oleen-activity.netlify.app'
// }));

// app.use(cors());

app.use(logger);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`server is running on port: ${PORT}`));