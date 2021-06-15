import React from 'react'
import { authmanager } from './authmanager'
import axios from './axios'
import { getTokenFromCookie } from './cookies'
import * as models from '../models'

const privateGuard = (Component) =>
  class extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        ready: false
      }
    }

    async componentDidMount() {
      models.App.apiType = 'apps'
      models.Doc.apiType = 'docs'

      try {
        const token = getTokenFromCookie()
        if (token) {
          authmanager.setToken(token)
        }

        axios.defaults.transformRequest.push((data, headers) => {
          const token = authmanager.getToken()
          if (token) {
            headers.common.Authorization = `Bearer ${token}`
          }

          return data
        })

        await authmanager.sync()
      } catch (e) {}

      if (authmanager.user) {
        this.setState({ ready: true })
      } else {
        const host = process.env.REACT_APP_PAW_HOST || ''
        window.location.href = `${host}/users/sign_in?identity_provider=paw-front&callback_url=${window.location.origin}`
      }
    }

    render() {
      if (!this.state.ready) {
        return null
      }

      return React.createElement(Component, this.props)
    }
  }

export default privateGuard
