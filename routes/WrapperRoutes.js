import express from "express";
import { FetchCalls} from "../Controller/WrapperController.js";


const wrapperroute = express.Router();


wrapperroute.get("/fetchCalls",FetchCalls);

export default wrapperroute;
