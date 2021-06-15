import { composeWithDevTools } from 'redux-devtools-extension'
import { applyMiddleware, createStore } from '@reduxjs/toolkit'

export const createModelStore = (Model) => {
  const initialState = {
    list: [],
    loading: false
  }
  const composeEnhancers = composeWithDevTools({
    name: Model.toString()
      .split('(' || /s+/)[0]
      .split(' ' || /s+/)[1]
  })

  return createStore(
    (state = initialState, { type, payload }) => {
      switch (type) {
        case 'LOAD':
          return { ...state, loading: true }
        case 'UNLOAD':
          return { ...state, loading: false }
        case 'UPSERT':
          const upsert = (item) => {
            const found = state.list.find((i) => i.id === item.id)
            if (found) {
              state = {
                ...state,
                list: state.list.map((i) => (i === found ? item : i))
              }
            } else {
              state = { ...state, list: [...state.list, item] }
            }
          }

          if (Array.isArray(payload)) {
            payload.forEach((item) => {
              return upsert(item instanceof Model ? item : new Model(item))
            })
          } else {
            upsert(payload instanceof Model ? payload : new Model(payload))
          }

          return state
        case 'UPDATE':
          const update = (item) => {
            const found = state.list.find((i) => i.id === item.id)
            if (found) {
              state = {
                ...state,
                list: state.list.map((i) => {
                  if (i === found) {
                    Object.assign(i, payload)
                  }

                  return i
                })
              }
            }
          }

          update(payload instanceof Model ? payload : new Model(payload))

          return state
        case 'DELETE':
          const found = state.list.find((i) => i.id === payload.id)
          return {
            ...state,
            list: [...state.list.filter((i) => i !== found)]
          }
        case 'REINIT':
          return { list: [] }
        default:
          return state
      }
    },
    undefined,
    composeEnhancers(applyMiddleware())
  )
}
