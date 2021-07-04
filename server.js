const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(require('./routes'));


console.log("first", mongoose.connection.readyState);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/pizza-hunt', {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=> console.log('database connected', mongoose.connection.readyState))
.catch(err => console.log("error", err));


console.log("after", mongoose.connection.readyState);

// use this to log mongo queries being executed
mongoose.set('debug', true);


app.listen(PORT, () => console.log(`🌍 Connected on localhost:${PORT}`));