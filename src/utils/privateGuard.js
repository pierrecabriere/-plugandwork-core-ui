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
      models.Space.apiType = 'spaces'

      try {
        const token = getTokenFromCookie() || localStorage.getItem('paw_token')
        if (token) {
          authmanager.setToken(token)
        }

        axios.interceptors.request.use(
          (config) => {
            const token = authmanager.getToken()
            if (token) {
              config.headers.Authorization = `Bearer ${token}`
            }

            return config
          },
          (error) => Promise.reject(error)
        )

        await authmanager.sync()
      } catch (e) {
        console.error(e)
      }

      if (authmanager.user) {
        this.setState({ ready: true })
      } else {
        if (process.env.NODE_ENV !== 'production') {
          const token = prompt('Entrez votre token de connexion')
          localStorage.setItem('paw_token', token)
          window.location.reload()
        } else {
          const host = process.env.REACT_APP_PAW_HOST || ''
          window.location.href = `${host}/users/sign_in?identity_provider=paw-front&callback_url=${window.location.origin}`
        }
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
