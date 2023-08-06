import express from 'express';
import cors from'cors'
import cookieparser from'cookie-parser'
import {config} from 'dotenv'
import morgan from 'morgan'
import route from './routers/user.route.js'
import errormiddleware from './middleware/middleware.js';
config();
const app = express();

app.use(express.json());
app.use(cors({
    origin: [process.env.FRONTENT_URL],
    credentials: true
}))
app.use(cookieparser())
app.use(morgan('dev'))
app.use('/ping', function(req, res){
    res.send('/pong')
}
)
app.use('/api/vi/user', route)

// route 3 modules

app.all('*', (req,res)=>{
    res.status(404).send('OOPS !! 404 page not found')
})
app.use(errormiddleware)
export default app