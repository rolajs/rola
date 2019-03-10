import '@/styles/main.css'

import { client } from 'hypr'
import routes from '@/routes.js'

client(routes, {})(document.getElementById('root'))
