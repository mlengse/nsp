require('dotenv').config()

const moment = require('moment')
const crypto = require('crypto')
const { Client } = require("node-rest-client");
const axios = require('axios')

const xConsId = process.env.XCONSID
const consPwd = process.env.CONSPWD
const usernamePcare = process.env.PCAREUSR
const passwordPcare = process.env.PCAREPWD
const kdAplikasi = process.env.KDAPP
const baseURL = process.env.APIV3


const getArgs = () => {
    const xTimestamp = moment.utc().format("X");
    const var1 = `${xConsId}&${xTimestamp}`;
    const xSignature = crypto
      .createHmac("sha256", consPwd)
      .update(var1)
      .digest("base64");
    const xAuthorization = `Basic ${Buffer.from(`${usernamePcare}:${passwordPcare}:${kdAplikasi}`).toString("base64")}`;

    return { headers: { "X-cons-id": xConsId, "X-Timestamp": xTimestamp, "X-Signature": xSignature, "X-Authorization": xAuthorization } };
}

const addPendaftaran = async pendaftaran => {
    const { headers } = getArgs()

    let apiURL = `${baseURL}`;

    const instance = axios.create({
        baseURL: apiURL,
        headers: headers
    })

    try{
        let { data } = await instance.post("/pendaftaran", pendaftaran);
        return data;
    } catch({response:{data}}) {
        return data
    }


}

const getPendaftaranProvider = async tanggal => {
    const args = getArgs();
    const client = new Client();
    let listAll = []
    let countAll = 1
    do {
      let start = listAll.length;
      let apiURL = `${baseURL}/pendaftaran/tglDaftar/${tanggal}/${start}/300`;
      let { response } = await new Promise(resolve =>  client.get(apiURL, args, data => resolve(data) ) );

      if (response) {
          if (response.count) {
              countAll = response.count;
          } 
          if (response.list && response.list.length) {
              listAll = [...listAll, ...response.list];
          }
      } else {
          countAll = 0
      }
    } while (listAll.length < countAll);
    return listAll;
} 

module.exports = {
    getPendaftaranProvider,
    addPendaftaran,
}
