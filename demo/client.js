import '@/src/styles/main.css'

import { client } from 'hypr/client'
import routes from '@/src/routes/index.js'

client(routes, {})(document.getElementById('root'))
