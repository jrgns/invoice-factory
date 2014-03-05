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
