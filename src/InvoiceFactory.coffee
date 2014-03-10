class InvoiceFactory extends Base
  constructor: ->
    @accessor 'templatePath'

  init: (@settings) ->
    @settings ?= {}
    @settings.element = jQuery(@settings.element ? '#online-invoice')

    @setTemplatePath(
      @settings.templatePath ? './assets/templates/invoice.js.html'
    )

    @registerEvents()

    this

  generate: (values) ->
    values ?= {}
    invoice = new Invoice(values, @settings.element)

    invoice.render()
    invoice.renderForm()

    invoice

  registerEvents: () ->
    # Handle the Confirm Line Button
    @settings.element.on(
      'click', '#confirm-line', jQuery.proxy(@confirmLine, this)
    )

    # Detect value changes
    @settings.element.on('change', 'input', jQuery.proxy(@formChange, this))

    # Handle the Edit Line Button
    @settings.element.on('click', '.edit-line', jQuery.proxy(@editLine, this))

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

  editLine: (evt) ->
    evt.preventDefault()

    line = jQuery(evt.target).closest('tr')
    number = line.data('number')
    invoice.currentLine = invoice.getLine(number)

    jQuery('#line-form').remove()

    form = tmpl('invoiceLineFormTemplate', invoice.currentLine)

    line.replaceWith(form)

  confirmLine: (evt) ->
    evt.preventDefault()

    @formChange()

    if invoice.currentLine.description.length > 0
      invoice.addLine(invoice.currentLine)
      invoice.renderForm()
    else
      jQuery('#description').closest('td').addClass('has-error')
      jQuery('#description').attr('placeholder', 'Please enter a description')

  formChange: (evt) ->
    invoice.currentLine.description = jQuery('#description').val()
    invoice.currentLine.quantity = parseFloat(jQuery('#quantity').val())
    invoice.currentLine.linePrice = parseFloat(jQuery('#linePrice').val())
    jQuery('#amount').val(money_format(invoice.currentLine.amount))

window.invoiceFactory = new InvoiceFactory()
