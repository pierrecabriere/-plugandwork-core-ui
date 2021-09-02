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
        ready: false,
        username: '',
        password: ''
      }
    }

    async componentDidMount() {
      models.App.apiType = 'contacts/apps'
      models.Doc.apiType = 'contacts/docs'
      models.Space.apiType = 'contacts/spaces'

      try {
        const { contactToken } = this.props.match.params
        if (contactToken) {
          const { data: contact } = await axios.post(
            `/api/pin_token?token=${contactToken}`
          )
          const accessToken = contact.access_token

          axios.interceptors.request.use(
            (config) => {
              const token = authmanager.getToken()
              if (token) {
                config.headers.Authorization = `Bearer ${accessToken}`
              }

              return config
            },
            (error) => Promise.reject(error)
          )

          this.setState({ contact: contact.id, ready: true })
        }
      } catch (e) {
        console.error(e)
      }
    }

    handleSubmit = async (e) => {
      e.preventDefault()

      const { username, password } = this.state

      try {
        const { data: contact } = await axios.post(
          `/api/pin_token?username=${username}&password=${password}`
        )
        const accessToken = contact.access_token

        axios.interceptors.request.use(
          (config) => {
            const token = authmanager.getToken()
            if (token) {
              config.headers.Authorization = `Bearer ${accessToken}`
            }

            return config
          },
          (error) => Promise.reject(error)
        )

        this.setState({ contact: contact.id, ready: true })
      } catch (e) {
        alert(
          'Une erreur est survenue, vérifiez que les identifiants sont corrects'
        )
      }
    }

    render() {
      if (!this.state.ready) {
        return (
          <div>
            <form onSubmit={this.handleSubmit}>
              <div>
                <label>Email</label>
                <input
                  value={this.state.username}
                  onChange={({ currentTarget }) =>
                    this.setState({ username: currentTarget.value })
                  }
                  type='email'
                />
              </div>
              <div>
                <label>Mot de passe</label>
                <input
                  value={this.state.password}
                  onChange={({ currentTarget }) =>
                    this.setState({ password: currentTarget.value })
                  }
                  type='password'
                />
              </div>

              <input type='submit' />
            </form>
          </div>
        )
      }

      return React.createElement(Component, {
        ...this.props,
        contact: this.state.contact
      })
    }
  }

export default publicGuard
