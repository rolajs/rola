import { client } from 'hypr'
import routes from './routes/index.js'

client(routes, {})(document.getElementById('root'))
