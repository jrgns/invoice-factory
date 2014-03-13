seen= []

class InvoiceFactory extends Base
  constructor: ->
    @accessor 'templatePath', 'storage'

  init: (@settings) ->
    @settings ?= {}
    @settings.element = jQuery(@settings.element ? '#online-invoice')

    @setTemplatePath(
      @settings.templatePath ? './assets/templates/invoice.js.html'
    )

    @storage = @settings.storage ? localStorage

    registerEvents(@settings.element)

    this

  generate: (values) ->
    values ?= {}
    invoice = new Invoice(values, @settings.element)

    invoice.render()

    invoice

  load: (identifier) ->
    values = @storage['invoice-' + identifier]

    if typeof values == 'string' and values != 'undefined'
      lines = []
      values = JSON.parse(values)

      invoice = {}
      for property, value of values
        property = property.replace(/^_/, '')

        switch property
          when 'element' then # Ignore element
          when 'lines'
            invoice[property] = []
            for line,number in value
              line = new InvoiceLine(
                number + 1,
                line['_description'],
                line['_quantity'],
                line['_linePrice'],
                line['_currency']
              )
              invoice[property][number] = line
          else
            invoice[property] = value

    else
      invoice = values

    if invoice
      @generate(invoice)
    else
      null

  save: (identifier, invoice) ->
    seen = []
    # TODO Some storage engines might not need the invoice to be stringified?
    @storage['invoice-' + identifier] = JSON.stringify(invoice, checkCyclic)

    this

  checkCyclic= (key, val) ->
    if typeof val == 'object'
      if val in seen
        return
      seen.push val
    val

  setTemplatePath: (templatePath) ->
    @_templatePath = templatePath
    jQuery('#invoiceTemplate').remove()
    jQuery('#invoiceLineTemplate').remove()
    jQuery('#invoiceLineFormTemplate').remove()

    # Retrieve the templates
    jQuery.ajax({
      url: templatePath,
      success: (template, xhr, status) -> jQuery('body').append(template),
      dataType: 'html',
      async: false
    })

  registerEvents= (element) ->
    # Handle the Confirm Line Button
    element.on(
      'click', '#confirm-line', confirmLine
    )

    # Detect value changes
    element.on('change', 'input', formChange)

    # Handle the Edit Line Button
    element.on('click', '.edit-line', editLine)

  editLine= (evt) ->
    evt.preventDefault()

    line = jQuery(evt.target).closest('tr')
    number = line.data('number')
    invoice.currentLine = invoice.getLine(number)

    jQuery('#line-form').remove()

    form = tmpl('invoiceLineFormTemplate', invoice.currentLine)

    line.replaceWith(form)

  confirmLine= (evt) ->
    evt.preventDefault()

    formChange()

    if invoice.currentLine.description.length > 0
      invoice.addLine(invoice.currentLine)
    else
      jQuery('#description').closest('td').addClass('has-error')
      jQuery('#description').attr('placeholder', 'Please enter a description')

  formChange= (evt) ->
    invoice.currentLine.description = jQuery('#description').val()
    invoice.currentLine.quantity = parseFloat(jQuery('#quantity').val())
    invoice.currentLine.linePrice = parseFloat(jQuery('#linePrice').val())
    jQuery('#amount').val(money_format(invoice.currentLine.amount))

window.invoiceFactory = new InvoiceFactory()
