import express from "express";
import { FetchCalls, Promtstatus, Promtstatustranscript, Transcript} from "../Controller/WrapperController.js";


const wrapperroute = express.Router();


wrapperroute.get("/fetchCalls",FetchCalls);
wrapperroute.get("/promtstatus",Promtstatus);
wrapperroute.get("/promtstatustranscript",Promtstatustranscript);
wrapperroute.get("/transcript",Transcript);


export default wrapperroute;
