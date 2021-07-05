import React from 'react'
import isEqual from 'fast-deep-equal/react'

export const connectModel = (Model, name, params) => (Component) => {
  return class ConnectedComponent extends React.Component {
    unsubscribe
    data
    prevLength

    constructor(props) {
      super(props)

      const defaultState = {
        query: {},
        loading: false,
        ids: [],
        count: undefined,
        pageSize: 10,
        page: 1,
        sort: undefined
      }

      if (params.init && typeof params.init === 'object') {
        this.state = Object.assign({}, defaultState, params.init)
      } else {
        this.state = defaultState
      }

      this.prevLength = Model.list.length
    }

    componentDidMount() {
      this.unsubscribe = Model.store.subscribe(async () => {
        const newList = Model.store.getState().list
        if (this.prevLength !== newList.length) {
          this.fetchData()
          this.prevLength = newList.length
        }
        this.forceUpdate()
      })

      if (params.init) {
        this.fetchData()
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (
        !isEqual(this.state.query, prevState.query) ||
        !isEqual(this.state.page, prevState.page) ||
        !isEqual(this.state.pageSize, prevState.pageSize) ||
        !isEqual(this.state.sort, prevState.sort)
      ) {
        if (this.state.query) {
          return this.fetchData()
        }
        // if (this.state.ids.length >= 1) {
        //   this.setState({ ids: [] });
        // }
      }
      return true
    }

    componentWillUnmount() {
      this.unsubscribe && this.unsubscribe()
    }

    getList() {
      const ModelList = Model.list
      return this.state.ids
        .map((id) => ModelList.find((item) => item.id === id))
        .filter(Boolean)
    }

    configure = async (
      { query, page, pageSize, sort },
      forceReload = false
    ) => {
      const newState = {}

      if (
        query !== undefined &&
        (forceReload || !isEqual(query, this.state.query))
      ) {
        newState.query = query
      }

      if (
        page !== undefined &&
        (forceReload || !isEqual(page, this.state.page))
      ) {
        newState.page = page
      }

      if (
        pageSize !== undefined &&
        (forceReload || !isEqual(pageSize, this.state.pageSize))
      ) {
        newState.pageSize = pageSize
      }

      if (
        sort !== undefined &&
        (forceReload || !isEqual(sort, this.state.sort))
      ) {
        newState.sort = sort
      }

      Object.keys(newState).forEach((key) => {
        if (newState[key] === null) {
          newState[key] = undefined
        }
      })

      this.setState(newState)
    }

    fetchData = (_query = this.state.query, refresh = false) => {
      this.setState({ loading: true })
      return new Promise(async (resolve) => {
        let ids = []
        let count
        if (_query && typeof _query === 'object') {
          const { page, pageSize: per_page, sort } = this.state
          const query = Object.assign({}, _query, { page, per_page, sort })
          const res = await Model.fetch(query, true, refresh)
          count = res.count
          ids = res.data?.map((item) => item.id) || []
        } else if (typeof _query === 'string') {
          const data = await Model.get(_query, true)
          ids = data ? [data.id] : []
        }
        this.setState({ ids, count, loading: false }, resolve)
      })
    }

    handleNextPage = () => {
      this.configure({ page: this.state.page + 1 })
    }

    handlePrevPage = () => {
      if (this.state.page <= 1) {
        return
      }

      this.configure({ page: this.state.page - 1 })
    }

    handleRefresh = () => {
      this.fetchData(this.state.query, true)
    }

    render() {
      const props = {
        ...this.props,
        [name]: {
          __connected: this,
          list: this.getList(),
          count: this.state.count,
          current: {
            page: this.state.page,
            pageSize: this.state.pageSize
          },
          refresh: this.handleRefresh,
          query: this.state.query,
          loading: this.state.loading,
          configure: this.configure,
          nextPage: this.handleNextPage,
          prevPage: this.handlePrevPage
        }
      }

      return React.createElement(Component, props)
    }
  }
}
