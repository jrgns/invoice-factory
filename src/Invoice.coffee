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

    # Setup total and lines
    @_total = 0
    @_lines = []

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

    jQuery('[data-show="invoice-' + name + '"]').html(data)

  render: () ->
    @element.html(tmpl('invoiceTemplate', this))

  renderForm: () ->
    @currentLine = new InvoiceLine(this)
    formHtml = tmpl('invoiceLineFormTemplate', @currentLine)
    @element.find('[data-show="invoice-lines"]').append(formHtml)

  renderLines: (lines) ->
    lines ?= @lines

    jQuery('#invoice-lines').html('')

    lines.reduce ((lines, line) ->
      lines += tmpl('invoiceLineTemplate', line)), ''

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
    @_lines = []
    @addLine line for line in lines ? []

  addLine: (line) ->
    if line not in @_lines
      @_lines.push(line)

    # Stil fire the events, as the line might have changed
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

  fromJSON: (jsonString) ->
    try
      values = JSON.parse(jsonString)
    catch error
      console.log(error)
      return null

    for property, value of values
      property = property.replace(/^_/, '')
      switch property
        when 'element' then # Ignore element
        when 'lines'
          for lineValues in value
            line = new InvoiceLine(this)
            line = line.fromJSON(JSON.stringify(lineValues))
            @addLine line
        when 'currentLine'
          line = new InvoiceLine(this)
          this[property] = line.fromJSON(JSON.stringify(value))
        when 'taxation'
          value = {
            rate: value.taxRate ? null,
            name: value.taxName ? 'Tax'
          }
          this[property] = value
        when 'tax', 'total'
          this[property] = parseInt(value)
        when 'date', 'dueDate'
          this[property] = new Date(value)
        else
          this[property] = value

    @renderForm()

    this

