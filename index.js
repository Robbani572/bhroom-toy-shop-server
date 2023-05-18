const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5444;
const app = express();

// middlewares
app.use(cors());
app.use(express())

app.get('/', (req, res) => {
    res.send('car is running')
})

app.listen(port, () => {
    console.log('car is running on road:', port)
})