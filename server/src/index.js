import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { apiRouter } from './routes/api.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 4000

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }))
app.use(express.json())

app.use('/api', apiRouter)

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
