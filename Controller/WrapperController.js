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



// export const FetchCalls = async (req, res) => {
//   try {
 
//     const accountSid = process.env.TWILIO_ACCOUNT_SID;

//     const authToken = process.env.TWILIO_AUTH_TOKEN;
//     const client = twilio(accountSid, authToken);
//     console.log('Fetching and storing recordings...');
//     const targetNumbers = [
//       '+13462751361',
//       '+13462755401'
//      ];
   
// //     const threeDaysAgo = new Date();
// // threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
// // console.log(threeDaysAgo)
// const calls = await client.calls.list({});

 
//   const filteredCalls = calls.filter(call => {
//     return targetNumbers.includes(call.to) || targetNumbers.includes(call.from);
//   });
//   console.log(filteredCalls)
//     // const callToMap = new Map();
//     // const callFroMMap = new Map();
//     // const oldcollection = db.collection('recordings_rows_two');
//     // for (let call of filteredCalls ) {
//     //   // console.log( call.to,call.from)
//     //   callToMap.set(call.sid, call.to);
//     //   callFroMMap.set(call.sid, call.from)
//     //   const existingRecording = await oldcollection.findOne({ call_sid: call.sid });
//     //   if (!existingRecording) {
//     //     // console.log(`Call SID: ${call.sid}, From: ${call.from}, To: ${call.to}, Status: ${call.status},${call}`);

//     //     const callRecordings = await client.recordings.list({ callSid: call.sid });
//     //     const to = callToMap.get(call.sid);
//     //     const from = callFroMMap.get(call.sid);
//     //     if (to) {
//     //       callRecordings.forEach(recording => {
//     //         recording.to = to;

//     //       });
//     //     }
//     //     if (from) {
//     //       callRecordings.forEach(recording => {

//     //         recording.from = from;
//     //       });
//     //     }
//     //     console.log('Call Recordings:', callRecordings);

//     //     if (callRecordings.length > 0) {
//     //       const serializedRecordings = callRecordings.map(recording => {
//     //         return JSON.stringify({
//     //           _id: recording.sid,
//     //           _airbyte_unique_key: recording.sid,
//     //           subresource_uris: recording.subresourceUris,
//     //           date_updated: recording.dateUpdated,
//     //           date_created: recording.dateCreated,
//     //           source: recording.source,
//     //           api_version: recording.apiVersion,
//     //           uri: recording.uri,
//     //           media_url: recording.mediaUrl,
//     //           sid: recording.sid,
//     //           duration: recording.duration,
//     //           price_unit: recording.priceUnit,
//     //           start_time: recording.startTime,
//     //           channels: recording.channels,
//     //           price: recording.price,
//     //           call_sid: recording.callSid,
//     //           account_sid: recording.accountSid,
//     //           call_status: recording.status,
//     //           to: recording.to,
//     //           from: recording.from,
//     //           _airbyte_ab_id: recording._airbyte_ab_id,
//     //           _airbyte_emitted_at: recording._airbyte_emitted_at,
//     //           _airbyte_normalized_at: recording._airbyte_normalized_at,
//     //           _airbyte_recordings_hashid: recording._airbyte_recordings_hashid
//     //         });
//     //       });

//     //       const result = await oldcollection.insertMany(serializedRecordings.map(serialized => JSON.parse(serialized)));
//     //       // console.log(`${result.insertedCount} recordings inserted into MongoDB`);
//     //     } else {
//     //       console.log('No recordings found for this call.');
//     //     }
//     //   }
//     // }

//     console.log('Recording fetching and storing complete.');
//   } catch (error) {
//     console.error('Error fetching and storing recordings:', error);
//   }
// }


export const FetchCalls = async (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

 

    const phoneNumbers = [ '+13462751361',
             '+13462755401'];

    // // Create an array of promises for each phone number
    // const promises = phoneNumbers.map(number =>
    //   client.calls.list({
    //     to: number,
    //     // Optionally, add additional filters like date range here
    //   })
    // );

    // // Resolve all promises to get the calls for all numbers
    // const results = await Promise.all(promises);

    // // Flatten the results into a single array
    // const allCalls = results.flat();
    // res.json(allCalls);
    // console.log(allCalls?.length)

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
    const filteredCalls = results.flat().flat(); // Flatten the nested arrays



    const callToMap = new Map();
    const callFroMMap = new Map();
    const oldcollection = db.collection('recordings_rows');
    for (let call of filteredCalls ) {
      // console.log( call.to,call.from)
      callToMap.set(call.sid, call.to);
      callFroMMap.set(call.sid, call.from)
      const existingRecording = await oldcollection.findOne({ call_sid: call.sid });
      if (!existingRecording) {
        // console.log(`Call SID: ${call.sid}, From: ${call.from}, To: ${call.to}, Status: ${call.status},${call}`);

        const callRecordings = await client.recordings.list({ callSid: call.sid });
        const to = callToMap.get(call.sid);
        const from = callFroMMap.get(call.sid);
        if (to) {
          callRecordings.forEach(recording => {
            recording.to = to;

          });
        }
        if (from) {
          callRecordings.forEach(recording => {

            recording.from = from;
          });
        }
        console.log('Call Recordings:', callRecordings);

        if (callRecordings.length > 0) {
          const serializedRecordings = callRecordings.map(recording => {
            return JSON.stringify({
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
              price_unit: recording.priceUnit,
              start_time: recording.startTime,
              channels: recording.channels,
              price: recording.price,
              call_sid: recording.callSid,
              account_sid: recording.accountSid,
              call_status: recording.status,
              to: recording.to,
              from: recording.from,
              _airbyte_ab_id: recording._airbyte_ab_id,
              _airbyte_emitted_at: recording._airbyte_emitted_at,
              _airbyte_normalized_at: recording._airbyte_normalized_at,
              _airbyte_recordings_hashid: recording._airbyte_recordings_hashid
            });
          });

          const result = await oldcollection.insertMany(serializedRecordings.map(serialized => JSON.parse(serialized)));
          // console.log(`${result.insertedCount} recordings inserted into MongoDB`);
        } else {
          console.log('No recordings found for this call.');
        }
      }
    }

    console.log('Recording fetching and storing complete.');

    // res.json(allCalls);
    // console.log(allCalls?.length)
  } catch (error) {
    console.error('Error fetching and storing recordings:', error);
    res.status(500).json({ message: 'Error fetching and storing recordings.', error: error.message });
  }
};

