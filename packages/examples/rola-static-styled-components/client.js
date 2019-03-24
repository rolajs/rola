import { client } from 'rola'
import routes from '@/routes.js'

client(routes)(document.getElementById('root'))
