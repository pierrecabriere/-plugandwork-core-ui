import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import privateGuard from './privateGuard'
import publicGuard from './publicGuard'

class ReactEntry extends React.Component {
  componentDidMount() {}

  render() {
    const { component, publicComponent } = this.props.app

    const _public = publicComponent && publicGuard(publicComponent)
    const _private = component && privateGuard(component)

    return (
      <BrowserRouter basename={this.props.basename}>
        <Switch>
          <Route component={_public} path='/public/:contactToken' />
          <Route component={_private} />
        </Switch>
      </BrowserRouter>
    )
  }
}

export default ReactEntry
