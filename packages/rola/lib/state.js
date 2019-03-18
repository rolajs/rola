import createStore from 'picostate'
import { connect } from '@picostate/react'

export const store = createStore({})

export const withState = connect
