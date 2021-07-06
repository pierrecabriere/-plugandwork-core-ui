import React from 'react'
import axios from './axios'
import * as models from '../models'
import { authmanager } from './authmanager'

const publicGuard = (Component) =>
  class extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        contact: null,
        ready: false
      }
    }

    async componentDidMount() {
      models.App.apiType = 'contacts/apps'
      models.Doc.apiType = 'contacts/docs'
      models.Space.apiType = 'contacts/spaces'

      const newState = { ready: true }

      try {
        const { contactToken } = this.props.match.params
        const { data: contact } = await axios.post(
          `/api/pin_token?token=${contactToken}`
        )

        newState.contact = contact.id
        axios.interceptors.request.use(
          (config) => {
            const token = authmanager.getToken()
            if (token) {
              config.headers.Authorization = `Bearer ${contact.access_token}`
            }

            return config
          },
          (error) => Promise.reject(error)
        )
      } catch (e) {
        console.error(e)
      }

      this.setState(newState)
    }

    render() {
      if (!this.state.ready) {
        return null
      }

      return React.createElement(Component, {
        ...this.props,
        contact: this.state.contact
      })
    }
  }

export default publicGuard
