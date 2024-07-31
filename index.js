import express from "express";

import dotenv from "dotenv";
import cors from "cors"
// import express from "express";
import wrapperroute from "./routes/WrapperRoutes.js";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import axios from "axios";
import cron from 'node-cron';

//connect DB

// mongoose
//   .connect('call-data.pjj1u.mongodb.net', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => console.log(err));

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors())

app.use("/wrapper", wrapperroute);

const baseURL = 'http://localhost:8003/wrapper'; 

const callFetchcallEndpoint = async () => {
  try {
    const response = await axios.get(baseURL + '/fetchCalls');
    console.log('Response from /fetchCalls:', response.data);
  } catch (error) {
    console.error('Error calling /fetchCalls:', error);
  }
};



cron.schedule('0 * * * *', () => {
  callFetchcallEndpoint();
});

const PORT = 8003;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
