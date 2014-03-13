class Invoice extends Base
  constructor: (values, @element) ->
    @accessor 'to', 'from', 'contact', 'description', 'date', 'dueDate', 'lines'
      , 'currentLine'
    @readable 'currency', 'taxation', 'total', 'tax'

    values ?= {}

    # Meta Info
    @_currency = values.currency ? '$'

    @_taxation = {
      rate: values.taxRate ? null,
      name: values.taxName ? 'Tax'
    }

    # Default Values
    @_to = values.to ? 'Client'
    @_from = values.from ? 'HackerPlanet'
    @_contact = values.contact ? 'info@hackerpla.net'
    @_description = values.description ? 'Client Side Invoicing'
    @_date = values.date ? new Date()
    @_dueDate = values.dueDate ? new Date(@_date + 7)
    @setLines(values.lines ? [])


  fireEvent: (name, data) ->
    @element.trigger('invoice-change', this)
    @element.trigger('invoice-' + name, data)

    template = jQuery.parseHTML(jQuery('#invoiceTemplate').html())
    template = jQuery(template)
      .find('[data-show="invoice-' + name + '"]').text()

    if (template)
      # Render the value
      cap = "#{name[0].toUpperCase()}#{name[1..-1]}"
      if "render#{cap}" of this
        data = this["render#{cap}"] data
      else
        vars = {}
        vars[name] = data
        data = tmpl(template, vars)

    @element.find('[data-show="invoice-' + name + '"]').html(data)

  render: () ->
    @element.html(tmpl('invoiceTemplate', this))
    @element.find('[data-show="invoice-lines"]').html(@renderLines(@_lines))

    this

  renderForm: () ->
    @currentLine = new InvoiceLine()
    tmpl('invoiceLineFormTemplate', @currentLine)

  renderLines: (lines) ->
    lines ?= @lines

    @element.find('#invoice-lines').html('')

    lines = lines.reduce ((lines, line) ->
      lines += tmpl('invoiceLineTemplate', line)), ''

    lines + @renderForm()

  getTax: ->
    @_tax = @_total * @_taxation.rate

  getTotal: (withTax = true) ->
    @_total = @lines?.reduce ((total, line) ->
      total + line.amount), 0
    @_total ?= 0

    if withTax
      @_total + @getTax()
    else
      @_total

  setLines: (lines) ->
    @_total = 0
    @_lines = []
    @addLine line, true for line in lines ? []

    @fireEvent 'lines', @lines
    @fireEvent 'total', @total
    @fireEvent 'tax', @tax

    this

  addLine: (line, batch) ->
    if line not in @_lines
      line.invoice = this
      @_lines.push(line)

    # Stil fire the events, as the line might have changed
    if not batch
      @fireEvent 'lines', @lines
      @fireEvent 'total', @total
      @fireEvent 'tax', @tax

    this

  getLine: (number) ->
    theLine = null

    @lines.forEach (line) ->
      if line.number == number
        theLine = line

    theLine
