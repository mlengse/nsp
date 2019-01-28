require('dotenv').config()

const { schedule } = require('node-cron')
const moment = require('moment')
const inputKonseling = require('./input')
const cron = process.env.CRON
schedule(cron, () => {
    console.log('input Konseling')
    console.log(moment().format('LLLL'))
    inputKonseling()
})