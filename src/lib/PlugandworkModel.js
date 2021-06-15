import axios from '../utils/axios'
import qs from 'qs'
import _ from 'lodash'
import { createModelStore } from '../utils/createModelStore'
import { connectModel } from '../utils/connectModel'
import ObjectID from 'bson-objectid'

class PlugandworkModel {
  static apiType
  static d3Compatible = true
  static _store
  static _cache
  static currentPage = 1

  id
  attributes
  type
  writers
  readers
  created_at
  updated_at
  relationships = []
  __populated = false

  static links = {
    first: null,
    last: null,
    next: null,
    prev: null,
    self: null
  }

  static get cache() {
    if (!this._cache) {
      this._cache = {}
    }
    return this._cache
  }

  static clearCache() {
    delete this._cache
  }

  constructor(values = {}) {
    this.id = values.id || new ObjectID().toString()
    this.attributes = values.attributes || {}

    return new Proxy(this, {
      get: (target, key) => {
        const _getter = (slug) => {
          if (
            typeof slug === 'string' &&
            Reflect.ownKeys(target.relationships).includes(slug)
          ) {
            return _.get(target.relationships, slug)
          }

          return _.get(target.attributes, slug) !== undefined
            ? _.get(target.attributes, slug)
            : _.get(target, slug)
        }

        switch (key) {
          case 'constructor':
            return target.constructor
          case 'attributes':
            return target.attributes
          case 'relationships':
            return values.relationships
          case '_raw':
            return values
          case 'id':
            return target.id
          case 'get':
            return _getter
          default:
            break
        }

        return _getter(key)
      }
    })
  }

  static get store() {
    if (!this._store) {
      this._store = createModelStore(this)
    }

    return this._store
  }

  static get list() {
    return this.store.getState().list
  }

  static async create(payload, handleError = false) {
    try {
      const {
        data: { data }
      } = await axios.post(`/api/d2/${this.apiType}`, {
        data: { attributes: payload }
      })
      const instance = new this(data)
      this.clearCache()
      this.store.dispatch({ type: 'UPSERT', payload: data })
      return instance
    } catch (e) {
      if (handleError) {
        alert('Une erreur est survenue, impossible de créer cet élément')
        console.error(e)
        return undefined
      }

      throw e
    }
  }

  static get(id, fetch) {
    const item = !fetch && this.list.find((model) => model.id === id)

    if (!item && fetch !== false) {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await this.fetch(id, false)
          resolve(this.get(res.id, false))
        } catch (e) {
          reject(e)
        }
      })
    }

    return item
  }

  static async fetch(query, count = true, refresh = false) {
    const cacheKey = JSON.stringify({ query, count })
    if (this.cache[cacheKey] && !refresh) {
      return this.cache[cacheKey]
    }

    try {
      let opt = { method: 'GET' }

      if (typeof query === 'string') {
        opt.url = `/api/d2/${this.apiType}/${query}`
      } else {
        if (this.d3Compatible && (query.search || query.title)) {
          opt.method = 'POST'
          opt.url = `/api/d3/search/${this.apiType}`
          opt.data = query
        } else {
          const params = qs.stringify(query, { arrayFormat: 'brackets' })
          opt.url = `/api/d2/${this.apiType}?${params}`
        }
      }

      const response = await axios(opt)
      const { data } = response
      // const upsertStore = !this.d3Compatible || (!query.search && !query.title);
      const formattedData = this.setDatas(data)
      let res
      if (count) {
        res = {
          count: data.meta.pagination.total_objects,
          data: formattedData
        }
      } else {
        res = formattedData
      }
      this.cache[cacheKey] = res
      return this.cache[cacheKey]
    } catch (e) {
      return []
    }
  }

  static async bulkUpdate(query, payload, url) {
    url = url || `/api/d2/${this.apiType}`
    let items
    if (!Array.isArray(query)) {
      const { data } = await this.fetch(query)
      items = data.map((i) => i.id)
    }

    const requests = items.map((id) => ({
      method: 'PATCH',
      url: `${url}/${id}`,
      body: {
        data: { attributes: payload }
      }
    }))
    await axios.post(`/api/d2/batch_sequential`, { requests })
  }

  static setDatas(axiosDatas, upsertStore = true) {
    try {
      const { data } = axiosDatas
      if (upsertStore) {
        this.store.dispatch({ type: 'UPSERT', payload: data })
      }
      if (Array.isArray(data)) {
        return data.map(
          (i) => this.list.find((_item) => _item.id === i.id) || new this(i)
        )
      }
      return this.list.find((_item) => _item.id === data.id) || new this(data)
    } catch (error) {
      return []
    }
  }

  async populate() {
    if (this.__populated) {
      return
    }

    try {
      const { apiType } = Object.getPrototypeOf(this).constructor
      const {
        data: { data }
      } = await axios.get(`/api/d2/${apiType}/${this.id}`)
      Object.assign(this, data)
      this.__populated = true
    } catch (e) {
      alert('Une erreur est survenue, impossible de peupler cet élément')
      console.error(e)
    }
  }

  async update(payload) {
    const { constructor } = Object.getPrototypeOf(this)
    try {
      const { apiType } = constructor
      const {
        data: { data }
      } = await axios.patch(`/api/d2/${apiType}/${this.id}`, {
        data: { attributes: payload }
      })
      constructor.store.dispatch({ type: 'UPDATE', payload: data })
      constructor.clearCache()
    } catch (e) {
      alert('Une erreur est survenue, impossible de mettre à jour cet élément')
      console.error(e)
    }
  }

  async delete(force = false) {
    if (
      !force &&
      !window.confirm('Voulez-vous vraiment supprimer cet élément ?')
    ) {
      return
    }

    const { constructor } = Object.getPrototypeOf(this)
    try {
      const { apiType } = constructor
      await axios.delete(`/api/d2/${apiType}/${this.id}`)
      constructor.store.dispatch({ type: 'DELETE', payload: this })
      constructor.clearCache()
    } catch (e) {
      if (!force) {
        alert('Une erreur est survenue, impossible de supprimer cet élément')
      }
      console.error(e)
    }
  }

  static connect(name, params = {}) {
    return connectModel(this, name, params)
  }
}

export default PlugandworkModel
