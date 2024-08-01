import express from "express";
import { FetchCalls, inboundcallscount, Promtstatus, Promtstatustranscript, Transcript} from "../Controller/WrapperController.js";


const wrapperroute = express.Router();


wrapperroute.get("/fetchCalls",FetchCalls);
wrapperroute.get("/promtstatus",Promtstatus);
wrapperroute.get("/promtstatustranscript",Promtstatustranscript);
wrapperroute.get("/transcript",Transcript);
wrapperroute.get("/inboundcount",inboundcallscount);


export default wrapperroute;
