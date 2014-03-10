class InvoiceLine extends Base
  constructor: (invoice, description, quantity, linePrice, currency) ->
    @accessor 'invoice', 'description', 'quantity', 'linePrice'
    @readable 'amount', 'number', 'currency'

    @_invoice = invoice
    @_quantity = quantity ? 1
    @_linePrice = linePrice ? 0
    @_description = description ? ''
    @_currency = currency ? invoice.currency

    @_number = invoice.lines.length + 1

  getAmount: ->
    @_quantity * @_linePrice

  fromJSON: (jsonString) ->
    try
      values = JSON.parse(jsonString)
    catch error
      console.log(error)
      return null

    for property, value of values
      property = property.replace(/^_/, '')
      switch property
        when invoice then # Ignore the invoice. Should be set when constructed
        when 'quantity', 'linePrice', 'amount'
          this[property] = parseFloat(value)
        when 'number'
          this[property] = parseInt(value)
        else
          this[property] = value

    this
