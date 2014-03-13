class InvoiceLine extends Base
  constructor: (number, description, quantity, linePrice, currency, invoice) ->
    @accessor 'number', 'description', 'quantity', 'linePrice', 'invoice'
    @readable 'amount', 'currency'

    @_invoice = invoice ? null
    @_quantity = quantity ? 1
    @_linePrice = linePrice ? 0
    @_description = description ? ''

    if invoice
      @_currency = currency ? invoice.currency
    else
      @_currency = currency ? '$'

    if invoice
      @_number = number ? invoice.lines.length + 1
    else
      @_number = number ? 1

  getAmount: ->
    @_quantity * @_linePrice

  setInvoice: (invoice) ->
    @_invoice = invoice
    @_number = invoice.lines.length + 1
