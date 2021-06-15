const SettingsFieldTypes = {
  SELECT: 'Select',
  TEXT: 'Text',
  JSON: 'JSON'
}

class SettingsField {
  static type
  slug
  type

  constructor(values, key) {
    if (Object.getPrototypeOf(this).constructor === SettingsField) {
      const TypeField = SettingsField.getFieldFromType(values.type)
      this.type = TypeField.type
      return new TypeField(values, key)
    }

    Object.assign(this, values)
    this.slug = key
    this.type = Object.getPrototypeOf(this).constructor.type
    return this
  }

  static getFieldFromType(type) {
    switch (type) {
      case SettingsFieldTypes.SELECT:
        return SettingsFieldSelect
      case SettingsFieldTypes.JSON:
        return SettingsFieldJSON
      default:
        return SettingsFieldText
    }
  }

  encode(value) {
    return value
  }

  decode(value) {
    return value
  }
}

class SettingsFieldSelect extends SettingsField {
  static type = SettingsFieldTypes.SELECT
  options = []

  encode(value) {
    if (this.options.find((o) => o.value === value)) {
      return value
    }

    const option = this.options.find((o) => o.label === value)
    return option?.value || null
  }

  decode(value) {
    const option = this.options.find((o) => o.value === value)
    return option?.label || null
  }
}

class SettingsFieldText extends SettingsField {
  static type = SettingsFieldTypes.TEXT

  encode(value) {
    return value?.toString() || ''
  }

  decode(value) {
    return value?.toString() || ''
  }
}

class SettingsFieldJSON extends SettingsField {
  static type = SettingsFieldTypes.JSON

  encode(value) {
    try {
      return JSON.stringify(value)
    } catch (e) {
      return '{}'
    }
  }

  decode(value) {
    try {
      return JSON.parse(value)
    } catch (e) {
      return {}
    }
  }
}

export {
  SettingsField,
  SettingsFieldSelect,
  SettingsFieldText,
  SettingsFieldJSON,
  SettingsFieldTypes
}

export default SettingsField
