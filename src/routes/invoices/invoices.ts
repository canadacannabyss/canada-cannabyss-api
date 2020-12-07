import { Router } from 'express'
import pdf from 'html-pdf'
import fs from 'fs'
import multer from 'multer'
import axios from 'axios'

import multerConfig from '../../config/multer/multerInvoice'

const router = Router()

const createPDF = (html, options) => {
  // pdf.create(html, options).toStream((err, stream) => {
  //   stream.pipe(fs.createWriteStream('./temp/foo.pdf'))
  // })
  // let bufferedFile;
  // pdf.create(html, options).toBuffer((err, buffer) => {
  //   console.log('buffer pdf:', buffer);
  //   bufferedFile = buffer;
  //   console.log('buffer.toJSON:', buffer.toJSON);
  // })
  // return bufferedFile;
  // pdf.create(html, options).toFile('./temp/foo.pdf', (err, res) => {
  //   console.log(res);
  // });
}

router.post('/create', async (req, res) => {
  const { names } = req.body

  const content = `
    <h1>Hello, ${names.firstName} ${names.lastName}</h1>
  `

  const options = {
    format: 'Letter',
    orientation: 'portrait',
  }

  const bufferedFileObj = createPDF(content, options)

  // const pdfFile = fs.readFileSync('../../../temp')

  // const formData = new FormData();
  // formData.append('file', )

  // axios
  // .post(`${apiEndpoint}`, formData)
  // .then(async (response) => {
  //   console.log('response:', response)
  //   setProcessedFilesArray((oldProcessedFilesArray) => [
  //     ...oldProcessedFilesArray,
  //     response
  //   ])
  // })
  // .catch((err) => {
  //   console.log(err)
  // })

  res.status(200).send({
    ok: true,
  })
})

router.post('/publish', multer(multerConfig).single('file'), (req, res) => {})

export default router
