import React from 'react'
import axios from './axios'
import * as models from '../models'

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

      const newState = { ready: true }

      try {
        const { contactToken } = this.props.match.params
        const { data } = await axios.post(
          `/api/pin_token?token=${contactToken}`
        )

        newState.contact = data.id
        axios.defaults.transformRequest.push((data, headers) => {
          headers.common.Authorization = `Bearer ${data.access_token}`
          return data
        })
      } catch (e) {}

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
