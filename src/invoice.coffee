Array.prototype.each = Array.prototype.forEach

currentInvoice = null
currentLine = null

class Base
    fireEvent: (@name, @data) ->

    readable: (args...) ->
        object = if @__proto__ then @__proto__ else this
        args.each (arg) =>
            return if Object.getOwnPropertyDescriptor(object, arg)
            cap = "#{arg[0].toUpperCase()}#{arg[1..-1]}"
            Object.defineProperty object, arg,
            get: ->
                if "get#{cap}" of this
                    this["get#{cap}"]()
                else
                    return this['_' + arg]

    accessor: (args...) ->
        object = if @__proto__ then @__proto__ else this
        args.each (arg) =>
            return if Object.getOwnPropertyDescriptor(object, arg)
            cap = "#{arg[0].toUpperCase()}#{arg[1..-1]}"
            Object.defineProperty object, arg,
            get: ->
                if "get#{cap}" of this
                    this["get#{cap}"]()
                else
                    return this['_' + arg]
            set: (value) ->
                if "set#{cap}" of this
                    this["set#{cap}"] value
                else
                    this['_' + arg] = value

                # Fire the Event
                @fireEvent arg, value

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

class Invoice extends Base
    constructor: (values, @element) ->
        @accessor 'to', 'from', 'contact', 'description', 'date', 'dueDate', 'lines'
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
        @element.trigger('invoice-' + name, data)

        template = jQuery.parseHTML(jQuery('#invoiceTemplate').html())
        template = jQuery(template).find('[data-show="invoice-' + name + '"]').text()

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
        currentLine = new InvoiceLine(this)
        formHtml = tmpl('invoiceLineFormTemplate', currentLine)
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

        @lines.each (line) ->
            if line.number == number
                theLine = line

        theLine


class InvoiceFactory extends Base
    constructor: ->
        @accessor 'templatePath'

    init: (@settings) ->
        @settings ?= {}
        @settings.element = jQuery(@settings.element ? '#online-invoice')

        @_templatePath = @settings.templatePath ? './assets/templates/invoice.js.html'

        # Retrieve the templates
        jQuery.ajax({
            url: @templatePath,
            success: (template, xhr, status) -> jQuery('body').append(template),
            dataType: 'html',
            async: false
        })

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
        @settings.element.on('click', '#confirm-line', jQuery.proxy(@confirmLine, this))

        # Detect value changes
        @settings.element.on('change', 'input', jQuery.proxy(@formChange, this))

        # Handle the Edit Line Button
        @settings.element.on('click', '.edit-line', jQuery.proxy(@editLine, this))

    editLine: (evt) ->
        evt.preventDefault()

        line = jQuery(evt.target).closest('tr')
        number = line.data('number')
        currentLine = invoice.getLine(number)

        jQuery('#line-form').remove()

        form = tmpl('invoiceLineFormTemplate', currentLine)

        line.replaceWith(form)

    confirmLine: (evt) ->
        evt.preventDefault()

        @formChange()

        if currentLine.description.length > 0
            invoice.addLine(currentLine)
            invoice.renderForm()
        else
            jQuery('#description').closest('td').addClass('has-error')
            jQuery('#description').attr('placeholder', 'Please enter a description')

    formChange: (evt) ->
        currentLine.description = jQuery('#description').val()
        currentLine.quantity = parseFloat(jQuery('#quantity').val())
        currentLine.linePrice = parseFloat(jQuery('#linePrice').val())
        jQuery('#amount').val(money_format(currentLine.amount))

window.invoiceFactory = new InvoiceFactory()
