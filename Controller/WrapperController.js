import axios from "axios";
import dotenv from "dotenv"
import { MongoClient, ObjectId } from 'mongodb';
import twilio from 'twilio';
dotenv.config();
const mongoUrl = process.env.MONGO_URL;


const api_key = process.env.APIKEY;

const uri = mongoUrl;
const dbName = 'DCB_Audio';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = client.db(dbName);


export const Transcript = async (req, res) => {
  try {
    const { call_sid, audioPath } = req.query;
    console.log("audiopath::::",audioPath)
    const assemblyAPIKey = process.env.ASSEMBLYAPIKEY;

    async function getTranscription(audio_url, recording) {
      try {
        const response = await axios.post('https://api.assemblyai.com/v2/transcript', {
          audio_url: audio_url,
          speaker_labels: true
        }, {
          headers: {
            'Authorization': `Bearer ${assemblyAPIKey}`,
            'Content-Type': 'application/json'
          }
        });

        const transcriptId = response.data.id;

        //  console.log(response.data)
        while (true) {
          const pollingResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
            headers: {
              'Authorization': `Bearer ${assemblyAPIKey}`,
            }
          });

          const transcriptionResult = pollingResponse.data;
          // console.log(transcriptionResult)    
          if (transcriptionResult.status === "completed") {
            const transcriptionData = JSON.stringify(transcriptionResult);
            await updateDatabase(recording, transcriptionData);
            // res.status(200).json({ "transcripe_data": transcriptionData, "message": 'Document updated successfully!' });
            break;
          } else if (transcriptionResult.status === "error") {
            throw new Error(`Transcription failed: ${transcriptionResult.error}`);
          } else {
            await new Promise(resolve => setTimeout(resolve, 3000)); // wait for 3 seconds before polling again
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    async function updateDatabase(callSid, transcriptionData) {
      try {

        const collection = db.collection('transcript');

        const filter = { call_sid: callSid };
        const updateDoc = {
          $set: { transcription: transcriptionData }
        };

        await collection.updateOne(filter, updateDoc);
        res.status(200).json({ "transcripe_data": transcriptionData, "message": 'Document updated successfully!' })
        console.log('Document updated successfully!');

      } catch (error) {
        console.error(error);
      }
    }
console.log("audiopath::::",audioPath)
    // Example usage
    if(audioPath!=="--"){
      console.log("entered",audioPath,call_sid)
      getTranscription(audioPath, call_sid);
    }else{
      const collection = db.collection('transcript');

        const filter = { call_sid: call_sid};
        const updateDoc = {
          $set: { transcription: "--" }
        };
        await collection.updateOne(filter, updateDoc);
        res.status(200).json({ "transcripe_data": "--", "message": 'Document updated successfully!' })
        console.log('Document updated successfully!');
    }

   
  }
  catch (err) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
}



// export const FetchCalls = async (req, res) => {
//   try {
//     const accountSid = process.env.TWILIO_ACCOUNT_SID;
//     const authToken = process.env.TWILIO_AUTH_TOKEN;
//     const client = twilio(accountSid, authToken);

 

//     const phoneNumbers = [ '+13462751361',
//              '+13462755401'];



//     const promises = phoneNumbers.map(number => {
//       return Promise.all([
//         // Fetch calls where the number is the 'to' number
//         client.calls.list({
//           to: number,
//           // Optionally, add additional filters like date range here
//         }),
//         // Fetch calls where the number is the 'from' number
//         client.calls.list({
//           from: number,
//           // Optionally, add additional filters like date range here
//         })
//       ]);
//     });

//     // Resolve all promises to get the calls for all numbers
//     const results = await Promise.all(promises);

//     // Flatten the results into a single array
//     const filteredCalls = results.flat().flat(); // Flatten the nested arrays
//  console.log("filteredcalls:::::",filteredCalls)


//     const callToMap = new Map();
//     const callFroMMap = new Map();
//     const oldcollection = db.collection('recordings_rows');
   

//     for (let call of filteredCalls) {
//       // Check if the call exists in the database, if not, insert it
//       const existingCall = await oldcollection.findOne({ call_sid: call.sid });
    
//       // console.log("direction:::",call?.direction)
//       if (!existingCall) {
//         console.log("hi")
//         const callData = {
//           _id: call.sid,
//           call_sid: call.sid,
//           sid: call.sid,
//           account_sid: call.accountSid,
//           from: call.from,
//           to: call.to,
//           status: call.status,
//           start_time: call.startTime,
//           end_time: call.endTime,
//           duration: call.duration,
//           date_created: call.dateCreated,
//           date_updated: call.dateUpdated,
//           direction: call.direction,
//           api_version: call.apiVersion,
//           price: call.price,
//           price_unit: call.priceUnit,
//           annotation: call.annotation,
//           forwarded_from: call.forwardedFrom,
//           group_sid: call.groupSid,
//           caller_name: call.callerName,
//           uri: call.uri,
//           direction:call.direction
//         };

//         await oldcollection.updateOne(
//           { _id: call.sid },
//           { $set: callData },
//           { upsert: true }
//         );
//       }
//     }
//     console.log('Recording fetching and storing complete.');

//     // res.json(allCalls);
//     // console.log(allCalls?.length)
//   } catch (error) {
//     console.error('Error fetching and storing recordings:', error);
//     res.status(500).json({ message: 'Error fetching and storing recordings.', error: error.message });
//   }
// };



export const FetchCalls = async (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);
    console.log('Fetching and storing recordings...');

    const phoneNumbers = [ '+13462751361','+13464366617',
      '+13462755401'];



const promises = phoneNumbers.map(number => {
return Promise.all([
 // Fetch calls where the number is the 'to' number
 client.calls.list({
   to: number,
   // Optionally, add additional filters like date range here
 }),
 // Fetch calls where the number is the 'from' number
 client.calls.list({
   from: number,
   // Optionally, add additional filters like date range here
 })
]);
});

// Resolve all promises to get the calls for all numbers
const results = await Promise.all(promises);

// Flatten the results into a single array
const calls = results.flat().flat(); 
// console.log("cals:::::",calls)
    const oldcollection = db.collection('recordings_rows');

    for (let call of calls) {
      const existingRecording = await oldcollection.findOne({ call_sid: call.sid });
      if (!existingRecording) {
        const callRecordings = await client.recordings.list({ callSid: call.sid });
console.log("callRecordings:::::",callRecordings)
        if (callRecordings.length > 0) {
    
          const serializedRecordings = callRecordings.map(recording => ({
            _id: recording.sid,
            _airbyte_unique_key: recording.sid,
            subresource_uris: recording.subresourceUris,
            date_updated: recording.dateUpdated,
            date_created: recording.dateCreated,
            source: recording.source,
            api_version: recording.apiVersion,
            uri: recording.uri,
            media_url: recording.mediaUrl,
            sid: recording.sid,
            duration: recording.duration,
            direction:call.direction,
            price_unit: recording.priceUnit,
            start_time: recording.startTime,
            channels: recording.channels,
            price: recording.price,
            call_sid: recording.callSid,
            account_sid: recording.accountSid,
            call_status: recording.status,
            to: call.to,
            from: call.from,
            _airbyte_ab_id: recording._airbyte_ab_id,
            _airbyte_emitted_at: recording._airbyte_emitted_at,
            _airbyte_normalized_at: recording._airbyte_normalized_at,
            _airbyte_recordings_hashid: recording._airbyte_recordings_hashid
          }));
         console.log("serializedRecordings",serializedRecordings)
          const result = await oldcollection.insertMany(serializedRecordings);
        } else {
         console.log("direction:::",call.direction)
          const defaultRecord = {
            _id: call.sid,
            account_sid: call.accountSid,
            _airbyte_unique_key: call.sid,
            subresource_uris: call.subresourceUris,
            date_updated: null,
            date_created: call.dateCreated,
            source: null,
            api_version: null,
            uri: call.uri,
            media_url: null,
            sid: null,
            duration: null,
            direction:call.direction,
            price_unit: null,
            start_time: null,
            channels: null,
            price: null,
            call_sid: call.sid,
            account_sid: call.accountSid,
            call_status: call.status,
            to: call.to,
            from: call.from,
            _airbyte_ab_id: null,
            _airbyte_emitted_at: null,
            _airbyte_normalized_at: null,
            _airbyte_recordings_hashid: null,
            
          };

          await oldcollection.insertOne(defaultRecord);
          console.log(`Inserted default record for call SID: ${call.sid}`);
        }
      }
    }

    console.log('Recording fetching and storing complete.');
  } catch (error) {
    console.error('Error fetching and storing recordings:', error);
  }
}

export const Promtstatustranscript = async (req, res) => {
  const collectionName = 'twilio_recordings';

  // API Endpoint
  const apiEndpoint = 'https://dcpquali2.onrender.com/wrapper/transcript';

  // Account SID and Auth Token
   const accountSid = process.env.TWILIO_ACCOUNT_SID;

  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // Function to convert media URL
  function convertMediaUrl(mediaUrl) {
    if (!mediaUrl) {
      console.error('Media URL is undefined or null');
      return null;
    }
    return `https://${accountSid}:${authToken}@${mediaUrl.substring(8)}`;

  }

  console.log('Connected to MongoDB successfully');

  const db = client.db(dbName);
  const collection = db.collection("recordings_rows");
  const transcriptCollection = db.collection("transcript");
  try {
    // Fetch Twilio recordings from MongoDB
    // Iterate over each recording
    async function processRecording(recording) {
      try {
        // Check if transcript exists for the recording
        const transcript = await transcriptCollection.findOne({
          call_sid: recording.sid,
          transcription: ""
        });

        // console.log(transcript)
        if (transcript) {
          console.log('Transcript not found for call SID:', recording.sid);
          if(recording.media_url){
            console.log(recording.media_url)
            const convertedMediaUrl = convertMediaUrl(recording.media_url);




            const apiResponse = await axios.get(apiEndpoint, {
              params: {
                call_sid: recording.sid,
                audioPath: convertedMediaUrl,
                from: recording.from,
                to: recording.to,
                start_time: recording.start_time
              }
            });
  
            // Assuming apiResponse.data contains the transcript data
            console.log('Transcript fetched for call SID:', recording.sid);
            return apiResponse.data;
          }else{
            const apiResponse = await axios.get(apiEndpoint, {
              params: {
                call_sid: recording.sid,
                audioPath: "--",
                from: recording.from,
                to: recording.to,
                start_time: recording.start_time
              }
            });
            return apiResponse.data;
          }
       
        } else {
          console.log('Transcript already exists for call SID:', recording.sid);
          return null; // Return null as transcript already exists
        }
      } catch (error) {
        console.error('Error processing recording:', error.response ? error.response.data : error.message);
        return null;
      }
    }
    // const twilioRecordings = await collection.find().toArray();
    const phoneNumbers = [ '+13462751361','+13464366617',
      '+13462755401'];
    
    const twilioRecordings = await collection.find({
      $or: [
        { to: { $in: phoneNumbers } },
        { from: { $in: phoneNumbers } }
      ]
    }).toArray();

    // Iterate over each recording, process it, and update transcript if necessary
    for (const recording of twilioRecordings) {
      if(recording.sid){
      const transcriptData = await processRecording(recording);
      }
      // if (transcriptData !== null) {

      //     await recordingsCollection.updateOne({ _id: recording._id }, { $set: { transcript: transcriptData } });
      // }
    }

    res.end("success")
  } catch (error) {
    console.error('Error fetching Twilio recordings from MongoDB:', error);
  }
}

export const Promtstatus = async (req, res) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;

    const authToken = process.env.TWILIO_AUTH_TOKEN;


    function convertMediaUrl(mediaUrl) {
      if (!mediaUrl) {
        console.error('Media URL is undefined or null');
        return null;
      }
      return `https://${accountSid}:${authToken}@${mediaUrl.substring(8)}`;
  
    }

  console.log('Connected to MongoDB successfully');

  const db = client.db(dbName);
  const collection = db.collection("recordings_rows");
  let validNames = [];
  try {
    // Fetch Twilio recordings from MongoDB
    // Iterate over each recording
    async function processRecording(recording, transcriptCollection) {
      console.log("recording:::::",recording)
      try {
        // Check if transcript exists for the recording
        const transcript = await transcriptCollection.findOne({ call_sid: recording.sid });

        if (!transcript) {
          let newtovalue = recording?.to;
          let user_email=""

         
    if (newtovalue === "+441494977140") {
      validNames = ["Des", "Dez", "Shannon", "Ashleigh", "Ashley", "Jessica", "Zainab", "Olivia", "--"];
  } else if (newtovalue === "+442081598005"||newtovalue==="442081296141") {
      validNames = ["Sushma", "Sara", "Margaret", "Gita", "Mita", "Emma", "--"];
  }
       
       
          
          console.log('Transcript not found for call SID:', recording.sid);
          if(recording.media_url){
            const convertedMediaUrl = convertMediaUrl(recording.media_url);
            let call_status = 'answered';
            let new_patient_status = '--';
            let appointment_status = 'No';
            let appointment_status_text = '--';
            let action_required_text = '--';
            let action_required = 'No';
            let insights = '--';
            let new_patient = '--';
            let prompt_text = '';
            let services = '--';
            let receptionist = '--';
            let services_type = '--';
            console.log(convertedMediaUrl)
            let  call_sid= recording.sid;
            let audio_url= convertedMediaUrl;
            let from= recording.from;
            let  to= recording.to;
              let start_time= recording.start_time
            let direction=recording.direction
              // console.log(audio_url)
              let body = {
                "audio_url": audio_url,
                "prompts": [
                  "Provide a summary in under 100 characters",
                  "Note any scheduled appointmentsCheck if any appointments were scheduled during the discussion; if so, note the date and time",
                  "Higlight for what services the patient has called for (Example: Teeth cleaning services)",
                  "Mention if the patient (or relevant person) discussed is a new or existing individual",
                  "Determine if the interaction in a phone call is managed by a live human agent or a computer-generated voice. Additionally, identify specific phrases that indicate business hours or closures such as we are closed for lunch or we are closed today",
                  "What is the name of the receptionist - The person who connects from the clinic.",
                  "Based on the conversation find out which service category term is used like Invisalign: teeth straightening/crooked teeth/braces/aligners/aligning teeth",
                  "Identify any action items suggested for doctors or the caller that is the patient"
                ]
              }
              const response = await axios.post(`https://prompt-llm.onrender.com/analyze-transcription`, body);
              const data_prompt = response.data;
          
              // if (!response_point_2.match(/1\) ([^.]+)|2\) ([^.]+)|3\) ([^.]+)|4\) ([^.]+)|5\) ([^.]+)|6\) ([^.]+)|7\) ([^.]+)|8\) ([^.]+)/)) {
              const live_call_keywords = ["caller reached", "phone call", "new and existing patients mentioned", "reason for call unclear", "unclear if new or existing patient"];
              const pre_recorded_keywords = ["phone menu provides options", "no appointments scheduled", "closed for lunch", "closed today", "reopening at", "Live human agent not indicated", 'voicemail'];
          
              let is_live_call = false;
              let is_pre_recorded_message = false;
          
              for (const keyword of live_call_keywords) {
               
                if (data_prompt.analyses[4].response.includes(keyword)) {
                  is_live_call = true;
                  break;
                }
              }
          
              for (const keyword of pre_recorded_keywords) {
                
                if (data_prompt.analyses[4].response.includes(keyword)) {
                  is_pre_recorded_message = true;
                  break;
                }
              }
          
              if (is_live_call) {
              
                call_status = 'hungup';
              } else if (is_pre_recorded_message) {
            
                call_status = 'voicemail';
              }
              // console.log(data_prompt.analyses[1].response)
          
              if (data_prompt.analyses[0].response) {
               
                insights = data_prompt.analyses[0].response.trim();
              }
              appointment_status_text = data_prompt.analyses[1].response.trim();
              if (appointment_status_text.includes("No appointment") || appointment_status_text.includes("no")) {
                
                appointment_status = 'No';
              } else {
              
                appointment_status = 'Yes';
              }
             console.log(start_time,call_sid,audio_url,data_prompt.analyses)
              // console.log(data_prompt)
          
              if (data_prompt.analyses[7].response) {
                
                action_required_text = data_prompt.analyses[7].response.trim();
                if (action_required_text.includes("No action") || action_required_text.includes("No") || action_required_text.includes("no clear action") || action_required_text.includes("no")) {
                  
                  action_required = 'No';
                } else {
                  
                  action_required = 'Yes';
                }
              }
              console.log(start_time)
              if (data_prompt.analyses[6].response) {
                
                services_type = data_prompt.analyses[6].response.trim();
              }
          
              if (data_prompt.analyses[3].response) {
                new_patient_status = data_prompt.analyses[3].response.includes("existing") || data_prompt.analyses[3].response.includes("Existing") ? 'Old' : 'New';
              }
              console.log(call_sid)
              // if (data_prompt.analyses[5].response) {
               
              //   if (data_prompt.analyses[5].response.includes("No receptionist") || data_prompt.analyses[5].response.includes("not mentioned")
              //     || data_prompt.analyses[5].response.includes("not provided")||data_prompt.analyses[5].response.includes("no name")) {
               
              //     receptionist = "--"
              //   }
              //   else if (data_prompt.analyses[5].response.includes("the name of the receptionist is")) {
                  
              //     const nameRegex = /the\s+name\s+of\s+the\s+receptionist\s+is\s+["']?([A-Za-z]+)["']?/i;
              //     const matches = data_prompt.analyses[5].response.match(nameRegex);
              //     if (matches && matches.length > 1) {
                   
              //       const name = matches[1];
              //       receptionist = name.charAt(0).toUpperCase() + name.slice(1);
                    
              //     }
              //   }
                
              // }
              
            if (data_prompt.analyses[5].response) {
              if (
                  data_prompt.analyses[5].response.includes("No receptionist") ||
                  data_prompt.analyses[5].response.includes("not mentioned") ||
                  data_prompt.analyses[5].response.includes("not provided") ||
                  data_prompt.analyses[5].response.includes("no name")
                  
                                                            
              ) {
                  receptionist = "--";
              } else if (newtovalue === "+441174502991" && data_prompt.analyses[5].response.toLowerCase().includes("the name of the receptionist is".toLowerCase())) {
                  
                  const nameRegex = /the\s+name\s+of\s+the\s+receptionist\s+is\s+["']?([A-Za-z]+)["']?/i;
                  const matches = data_prompt.analyses[5].response.match(nameRegex);
                  if (matches && matches.length > 1) {
                      console.log("2")
                      const name = matches[1];
                      receptionist = name.charAt(0).toUpperCase() + name.slice(1);
                  }
              } else {
                  let foundReceptionist = false;
                  for (const name of validNames) {
                      if (data_prompt.analyses[5].response.toLowerCase().includes(name.toLowerCase())) {
                         
                          receptionist = name.charAt(0).toUpperCase() + name.slice(1);
                          console.log(receptionist)
                          foundReceptionist = true;
                          break; // Exit the loop once a valid receptionist name is found
                      }
                  }
          
                  if (!foundReceptionist) {
                      
                      receptionist = "--";
                  }
              }
          }



            console.log(audio_url)
            if (data_prompt.analyses[6].response) {
              if (data_prompt.analyses[6].response.includes("service category term used") || data_prompt.analyses[6].response.includes("service category term is")) {
                const splitResponse = data_prompt.analyses[6].response.includes("service category term used") ?
                                        data_prompt.analyses[6].response.split('service category term used') :
                                        data_prompt.analyses[6].response.split('service category term is');
                                        if (splitResponse.length > 1) {
                                          const term = splitResponse[1].match(/"([^"]+)"/);
                                          if (term) {
                                              services = term[1];
                                          }
                                      }
              }
                else if(data_prompt.analyses[6].response.includes("the term used for teeth straightening services is")){
                  const splitResponse = data_prompt.analyses[6].response.includes("the term used for teeth straightening services") ?
                  data_prompt.analyses[6].response.split('the term used for teeth straightening services') :
                  data_prompt.analyses[6].response.split('the term used for teeth straightening services is');
                  if (splitResponse.length > 1) {
                    const term = splitResponse[1].match(/"([^"]+)"/);
                    if (term) {
                        services = term[1];
                    }
                }
                  }
              // services = data_prompt.analyses[6].response.includes("service category term used is") || data_prompt.analyses[6].response.includes("service category term") ? data_prompt.analyses[6].response.split('term used')[1].trim() : '--';
              
            }
            console.log(services)
            const data_update = {
              date_created: start_time,
              call_sid: call_sid,
              local_record_path: audio_url,
              recordings: audio_url,
              transcription: '',
              transcript: '',
              appointment_status,
              action_required,
              insights,
              appointment_status_text,
              action_required_text,
              new_patient_status,
              new_patient,
              call_status,
              prompt_text: data_prompt.analyses,
              services_type: services_type,
              services,
              receptionist,
              from: from,
              trackingnumber: to,
              direction:direction
            };
        
            // const dataJson = JSON.stringify(data_update);
        
        
            const collection = db.collection('transcript');
        
            // const result = await collection.insertOne(data_update);

            const result = await collection.updateOne(
              { call_sid: recording.sid },
              { $setOnInsert: data_update },
              { upsert: true }
            );
            console.log('Transcript fetched for call SID:', recording.sid);
            return result;
          }else{
            console.error('Media URL is undefined or null');
      
           
           
              
              console.log('Transcript not found for call SID:', recording.sid);
              // const convertedMediaUrl = convertMediaUrl(recording.media_url);
      
      
              let call_status = 'answered';
              let new_patient_status = '--';
              let appointment_status = 'No';
              let appointment_status_text = '--';
              let action_required_text = '--';
              let action_required = 'No';
              let insights = '--';
              let new_patient = '--';
              let prompt_text = '';
              let services = '--';
              let receptionist = '--';
              let services_type = '--';
            
            
              
               let  call_sid= recording.sid;
              let audio_url= "--";
              let from= recording.from;
              let  to= recording.to;
                let start_time= recording.start_time
              let direction=recording.direction
              
      
                const data_update = {
                  date_created: start_time,
                  call_sid: call_sid,
                  local_record_path: audio_url,
                  recordings: audio_url,
                  transcription: '',
                  transcript: '',
                  appointment_status,
                  action_required,
                  insights,
                  appointment_status_text,
                  action_required_text,
                  new_patient_status,
                  new_patient,
                  call_status,
                  prompt_text:"--",
                  services_type: services_type,
                  services,
                  receptionist,
                  from: from,
                  trackingnumber: to,
                  direction:direction
                };
            
                // const dataJson = JSON.stringify(data_update);
            
            
                const collection = db.collection('transcript');
            
                // const result = await collection.insertOne(data_update);
                const result = await collection.updateOne(
                  { call_sid: recording.sid },
                  { $setOnInsert: data_update },
                  { upsert: true }
                );
               
              //   res.status(200).json({ "transcripe_data":data_prompt , "data": data_update })
            
              
              console.log('Transcript fetched for call SID:', recording.sid);
              return result;
            } 
          
       


         
        
          
         

          
         
        } else {
          console.log('Transcript already exists for call SID:', recording.sid);
          return null; // Return null as transcript already exists
        }
      } catch (error) {
        if(error?.response?.data?.error==="Error analyzing transcription"){
          const transcript = await transcriptCollection.findOne({ call_sid: recording.sid });
  
          if (!transcript) {
            let newtovalue = recording?.to;
            let user_email=""
  
           
  
  // Define the valid names based on the phone number
      if (newtovalue === "+441494977140") {
        validNames = ["Des", "Dez", "Shannon", "Ashleigh", "Ashley", "Jessica", "Zainab", "Olivia", "--"];
    } else if (newtovalue === "+442081598005"||newtovalue==="442081296141") {
        validNames = ["Sushma", "Sara", "Margaret", "Gita", "Mita", "Emma", "--"];
    }
         
         
            
            console.log('Transcript not found for call SID:', recording.sid);
            const convertedMediaUrl = convertMediaUrl(recording.media_url);
  
  
            let call_status = 'answered';
            let new_patient_status = '--';
            let appointment_status = 'No';
            let appointment_status_text = '--';
            let action_required_text = '--';
            let action_required = 'No';
            let insights = '--';
            let new_patient = '--';
            let prompt_text = '';
            let services = '--';
            let receptionist = '--';
            let services_type = '--';
            console.log(convertedMediaUrl)
          
            
             let  call_sid= recording.sid;
            let audio_url= convertedMediaUrl;
            let from= recording.from;
            let  to= recording.to;
              let start_time= recording.start_time
          let direction=recording.direction
            
  
              const data_update = {
                date_created: start_time,
                call_sid: call_sid,
                local_record_path: audio_url,
                recordings: audio_url,
                transcription: '',
                transcript: '',
                appointment_status,
                action_required,
                insights,
                appointment_status_text,
                action_required_text,
                new_patient_status,
                new_patient,
                call_status,
                prompt_text:"--",
                services_type: services_type,
                services,
                receptionist,
                from: from,
                trackingnumber: to,
                direction:direction
              };
          
              // const dataJson = JSON.stringify(data_update);
          
          
              const collection = db.collection('transcript');
          
              // const result = await collection.insertOne(data_update);
              const result = await collection.updateOne(
                { call_sid: recording.sid },
                { $setOnInsert: data_update },
                { upsert: true }
              );
             
            //   res.status(200).json({ "transcripe_data":data_prompt , "data": data_update })
          
            
            console.log('Transcript fetched for call SID:', recording.sid);
            return result;
          } else {
            console.log('Transcript already exists for call SID:', recording.sid);
            return null; // Return null as transcript already exists
          }
        }else{
          console.error('Error processing recording:', error.response ? error.response.data : error.message);
          return null;
        }
      }
    }
    // const twilioRecordings = await collection.find().toArray();
    const phoneNumbers = [ '+13462751361','+13464366617',
      '+13462755401'];
    
    const twilioRecordings = await collection.find({
      $or: [
        { to: { $in: phoneNumbers } },
        { from: { $in: phoneNumbers } }
      ]
    }).toArray();
    // console.log(twilioRecordings)
    const transcriptCollection = db.collection("transcript");
    // Iterate over each recording, process it, and update transcript if necessary
    for (const recording of twilioRecordings) {
      if(recording.sid){
        await processRecording(recording, transcriptCollection);
      }

    }

    res.end("success")
  } catch (error) {
    console.error('Error fetching Twilio recordings from MongoDB:', error.message);
  }
}


export const inboundcallscount=async(req,res)=>{
  const user_email = req.query.user_email;
  const period = req.query.period;
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;
  const currentDate = new Date();
  if (!start_date && !end_date) {
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - parseInt(period || 0));
    console.log(currentDate)
    console.log(startDate)
  }
 try {
  var days = parseInt(period);
  // Normalize the time component of currentDate
  currentDate.setHours(0, 0, 0, 0);
  var currentDay = currentDate.getDay();
  var startOfWeek = new Date(currentDate);
  var differenceToMonday = currentDay - 1;
  if (differenceToMonday < 0) differenceToMonday += 7;
  startOfWeek.setDate(currentDate.getDate() - differenceToMonday);
  const collection = db.collection("recordings_rows");
  const phoneNumbers = [ '+13462751361','+13464366617',
    '+13462755401'];
  const twilioRecordings = await collection.find({
    $or: [
      { to: { $in: phoneNumbers } },
      { from: { $in: phoneNumbers } }
    ]
  }).toArray();

let filteredData=[]

  if (start_date && end_date) {
    var startDateObj = new Date(start_date);
    var endDateObj = new Date(end_date);
    endDateObj.setHours(23, 59, 59, 999);
    filteredData = twilioRecordings.filter(function (item) {
      var itemStartDate = new Date(item.date_created);
      return itemStartDate >= startDateObj && itemStartDate <= endDateObj;
    })
  } else {
    filteredData = twilioRecordings.filter(function (item) {
      var itemDate = new Date(item.date_created);
      // Normalize the time component of itemDate
      itemDate.setHours(0, 0, 0, 0);
      var differenceInTime = currentDate.getTime() - itemDate.getTime();
      var differenceInDays = differenceInTime / (1000 * 3600 * 24);
      // Return true if the difference in days falls within the selected time period
      console.log("days",days)
      if (days === 0 && itemDate.getMonth() === currentDate.getMonth() && itemDate.getFullYear() === currentDate.getFullYear()) {
        return true;
      } else if (days === 7 && itemDate >= startOfWeek && itemDate <= currentDate) {
        return true;
      } else if (days === 30 && differenceInDays <= 30) {
        return true;
      } else if (days === 60 && differenceInDays <= 60) {
        return true;
      } else if (days === 90 && differenceInDays <= 90) {
        return true;
      }
      return false;
    });
  }
 
  const inboundCalls = filteredData.filter(recording => recording.direction === 'inbound');
  const qualifiedInbound = inboundCalls.filter(call => call.status === 'qualified').length;
  const notQualifiedInbound = inboundCalls.filter(call => call.status === 'not qualified').length;
  const outboundApiCalls = filteredData.filter(recording => recording.direction === 'outbound-api');
  const outboundDialCalls = filteredData.filter(recording => recording.direction === 'outbound-dial');
  const qualifiedInbound2 = outboundApiCalls .filter(call => call.status === 'qualified').length;
  const notQualifiedInbound2 = outboundApiCalls .filter(call => call.status === 'not qualified').length;
  // Response with counts
  res.json({
    inbound: {
      count: inboundCalls.length,
      qualifiedCount: qualifiedInbound,
      notQualifiedCount: notQualifiedInbound,
      calls: inboundCalls
    },
    outboundApi: {
      count: outboundApiCalls.length,
      qualifiedCount: qualifiedInbound2,
      notQualifiedCount: notQualifiedInbound2,
      calls: outboundApiCalls
    },
    outboundDial: {
      count: outboundDialCalls.length,
      calls: outboundDialCalls
    }
  });
 } catch (error) {
  console.log(error)
 }
}

export const updateCallStatusAndComments = async (req, res) => {
  const { call_sid, status, comments } = req.body; // Expecting call_sid, status, and comments in the request body

  try {
    // Validate call_sid
    if (!call_sid) {
      return res.status(400).json({ error: 'Call ID is required' });
    }

    // Connect to the collection
    const collection = db.collection("recordings_rows");

    // Find the document by call_sid and update the status and comments
    const result = await collection.updateOne(
      { call_sid: call_sid }, // Match documents based on call_sid
      {
        $set: {
          status: status || '', // Set status if provided, else set empty string
          comments: comments || '' // Set comments if provided, else set empty string
        }
      },
      { upsert: true } // Creates the document if it does not exist
    );

    // Check if the document was modified
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Response with a success message
    res.json({ message: 'Status and comments updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the document' });
  }
};

