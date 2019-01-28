require('dotenv').config()

const excelToJson = require('convert-excel-to-json')

const filename = process.env.FILE

const db = () => {
    const result = excelToJson({
        sourceFile: `./${filename}`,
        header: {
            rows: 1
        },
        sheets: ['DATA SMS KBK']
    })

    return result['DATA SMS KBK'].map( row => row['A'].toString().padStart(13,'0'))
}

//console.log(db())

module.exports = db