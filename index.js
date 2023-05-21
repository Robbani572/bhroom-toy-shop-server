const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();

// middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uvrlcrq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// const verifyJwt = (req, res, next) => {
//   console.log('hitting verify jwt')
//   console.log(req.headers.authorization)
//   const authorization = req.headers.authorization;
//   if (!authorization) {
//     return res.status(401).send({ error: true, message: 'Unauthorized access' })
//   }
//   const token = authorization.split(' ')[1];
//   console.log(token)
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
//     if (error) {
//       return res.status(403).send({ error: true, message: 'Unauthorized access' })
//     }
//     else {
//       req.decoded = decoded;
//     }
//   })
//   next()
// }


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const toyData = client.db('toyDB').collection('toys')


    app.post('/jwtToken', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      console.log(token)
      res.send({ token })
    })

    app.post('/products', async (req, res) => {
      const newToy = req.body;
      console.log(newToy)
      const result = await toyData.insertOne(newToy)
      res.send(result)
    })

    // get data by email
    app.get('/products', async (req, res) => {

      // const decoded = req.decoded;
      // if(decoded.email !== req.query.email){
      //   return res.status(403).send({error: true, message: 'Forbidden access'})
      // }

      let query = {}
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await toyData.find(query).toArray()
      res.send(result)
    })

    // get data by product name
    // app.get('/products', async(req, res) => {
    //   console.log(req.query)
    //   let query = {};
    //   if (req.query?.name) {
    //     query = { name: req.query.name }
    //   }
    //   const result = await toyData.find(query).toArray()
    //   res.send(result)
    // })

    // get data for pagination
    app.get('/products', async(req, res) => {
      console.log(req.query)
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page -1) * limit;
      console.log(limit, skip)
      const result = await toyData.find().skip(skip).limit(limit).toArray();
      res.send(result)
    })

    // get data by product id
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyData.findOne(query)
      res.send(result)
    })

    

    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyData.deleteOne(query)
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('car is running')
})

app.listen(port, () => {
  console.log('car is running on road:', port)
})