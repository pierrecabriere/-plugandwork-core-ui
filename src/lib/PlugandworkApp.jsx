import React from 'react'
import SettingsField from './SettingsField'

class PlugandworkApp {
  static getSettingsFields = () => {
    const { schema } = this.settings

    if (!schema || typeof schema !== 'object') {
      return []
    }

    return Object.keys(schema).map((key) => {
      const schemaField = schema[key]

      if (schemaField instanceof SettingsField) {
        return schemaField
      }

      return new SettingsField(schema[key], key)
    })
  }

  static component = (props) => <div>Hello World !</div>
  static publicComponent = (props) => <div>Hello World !</div>
  static settings = {}
  static icon = null
  static handleDoc = () => false
  static async onInstall(view) {}
  static async onUninstall(view) {}
}

export default PlugandworkApp
