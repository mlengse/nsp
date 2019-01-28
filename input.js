require('dotenv').config()

const moment = require('moment')
const logUpdate = require("log-update");
const {
    getPendaftaranProvider,
    addPendaftaran,
} = require('./rest-api')

const db = require('./db')
const writeStat = (tgl, jml, total) => {
  logUpdate(`
  tgl: ${tgl}
  jml kunj hari ini: ${jml}
  jml kunj bln ini: ${total}
`);
};

const jmlPeserta = process.env.JML

const uniqEs6 = arrArg =>
  arrArg.filter((elem, pos, arr) => arr.indexOf(elem) == pos);

const getRandomSubarray = (arr, size) => {
  let shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
};

module.exports = async ()=>{

    let tgl = moment().date()
    let blnThn = moment().format('MM-YYYY')
    let kunjBlnIni = []

    while(tgl) {
        let tglHariIni = `${tgl}-${blnThn}`
        let kunjHariIni = await getPendaftaranProvider(tglHariIni)
        kunjBlnIni = [ ...kunjBlnIni, ...kunjHariIni]
        writeStat(tglHariIni, kunjHariIni.length, kunjBlnIni.length)
        tgl--
    }

    const kartuList = kunjBlnIni.map( ({ peserta : { noKartu } }) => noKartu)
    const uniqKartu = uniqEs6(kartuList)
    console.log(`jml kunj unik: ${uniqKartu.length}`)

    if (uniqKartu.length/jmlPeserta < 0.15) {
        const kekurangan = jmlPeserta*0.15 - uniqKartu.length
        console.log(`kekurangan contact rate: ${kekurangan}`);
        const sisaHari = moment().to(moment().endOf("month"));
        console.log(`sisa hari: ${sisaHari}`);
        const pembagi = sisaHari
          .replace("in", "")
          .replace("days", "")
          .trim();
        const akanDiinput = Math.floor((kekurangan / pembagi / 6) * 0.6);
        console.log(`akan diinput: ${akanDiinput}`)

        const listAll = db()

        if(listAll && listAll.length) {
          console.log(`jml pst di database: ${listAll.length}`);
          const listReady = listAll.filter( no  => uniqKartu.indexOf(no) == -1)
          console.log(`jml pst blm diinput: ${listReady.length}`);
          const randomList = getRandomSubarray(listReady, akanDiinput)
          const detailList = randomList.map( no => ({
              "kdProviderPeserta": process.env.PCAREUSR,
              "tglDaftar": moment().format('DD-MM-YYYY'),
              "noKartu": no,
              "kdPoli": '021',
              "keluhan": null,
              "kunjSakit": false,
              "sistole": 0,
              "diastole": 0,
              "beratBadan": 0,
              "tinggiBadan": 0,
              "respRate": 0,
              "heartRate": 0,
              "rujukBalik": 0,
              "kdTkp": '10'
          }))
  
          for(let kunj of detailList) {
              console.log(kunj.noKartu)
              let response = await addPendaftaran(kunj)
              if(response) console.log(response)
          }
  
        } else {
          console.log('excell error')
        }

   }
}
