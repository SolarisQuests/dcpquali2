import express from "express";
import { FetchCalls, inboundcallscount, Promtstatus, Promtstatustranscript, Transcript, updateCallStatusAndComments} from "../Controller/WrapperController.js";


const wrapperroute = express.Router();


wrapperroute.get("/fetchCalls",FetchCalls);
wrapperroute.get("/promtstatus",Promtstatus);
wrapperroute.get("/promtstatustranscript",Promtstatustranscript);
wrapperroute.get("/transcript",Transcript);
wrapperroute.get("/inboundcount",inboundcallscount);
wrapperroute.post("/upadtecall",updateCallStatusAndComments);

export default wrapperroute;
