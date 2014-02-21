Array.prototype.each = Array.prototype.forEach

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
    constructor: (invoice, description, quantity, line_price, currency) ->
        @accessor 'invoice', 'description', 'quantity', 'line_price', 'currency'
        @readable 'amount', 'number'

        @invoice = invoice
        @quantity = quantity
        @line_price = line_price
        @description = description
        @currency = currency ? invoice.currency

        @_number = invoice.lines.length + 1

    getAmount: ->
        @_quantity * @_line_price

class Invoice extends Base

    taxation = { rate: null, name: null }

    constructor: (values, @element) ->
        taxation.rate = @settings?.taxRate ? null
        taxation.name = @settings?.taxName ? 'Tax'

        @accessor 'currency', 'to', 'from', 'contact', 'description', 'date', 'dueDate', 'lines', 'total', 'tax'

        @currency = values?.currency ? '$'

        @to = values?.to ? 'Client'
        @from = values?.from ? 'HackerPlanet'
        @contact = values?.contact ? 'info@hackerpla.net'
        @description = values?.description ? 'Client Side Invoicing'
        @date = values?.date ? new Date()
        @dueDate = values?.dueDate ? new Date().setDate(new Date().getDate() + 7)
        @lines = values?.lines ? []

        # Rather calculate these
        @tax = values?.tax

    fireEvent: (name, data) ->
        @element.trigger('invoice-' + name, data)

        # Render the value
        cap = "#{name[0].toUpperCase()}#{name[1..-1]}"
        if "render#{cap}" of this
            html = this["render#{cap}"] data
        else
            html = data

        @showElement(name, html)

    showElement: (name, html) ->
        # Consider renaming this to rather use data-model or something
        jQuery('#invoice-' + name + '-show').html(html);

    renderTotal: (total) ->
        total ?= @total

        tmpl('invoiceTotalTemplate', { total: total, currency: @currency } )

    renderLines: (lines) ->
        lines ?= @lines

        jQuery('#invoice-lines').html('')

        lines = lines.reduce ((lines, line) ->
            lines += tmpl('invoiceLineTemplate', line)), ''

        # TODO Add tax line if necessary

        lines

    getTax: ->
        @_total * taxation.rate

    getTotal: (@withTax = true) ->
        @_total = @lines.reduce ((total, line) ->
            total + line.amount), 0

        if @withTax
            @_total + @getTax()
        else
            @_total

    addLine: (line) ->
        if line not in @_lines
            @_lines.push(line)

        @fireEvent 'lines', @lines
        @fireEvent 'total', @total

class InvoiceFactory extends Base
    constructor: ->
        @accessor 'template_path'

    init: (@settings) ->
        @settings.element = jQuery(@settings?.element ? '#online-invoice')

        @template_path = @settings?.template_path ? './assets/templates/invoice.js.html'

        # Retrieve the templates
        jQuery.ajax({
            url: @template_path,
            success: (template, xhr, status) -> jQuery('body').append(template);,
            dataType: 'html',
            async: false
        })

        @registerEvents()

        this

    generate: (values) ->
        invoice = new Invoice(values, @settings.element)

        @settings.element.html(tmpl('invoiceTemplate', invoice))

        # Both of these work, but I don't like either of them.
        # invoice.total = 0 # This won't work if we begin with a number of lines
        # invoice.showElement('total', invoice.renderTotal()) # This looks hackish

        invoice

    registerEvents: () ->
        # Detect value changes
        #@settings.element.on('change', 'input', jQuery.proxy(@handleFormChange, this))

        # Handle the Confirm Line Button
        #@settings.element.on('click', '#confirm-line', jQuery.proxy(handleConfirmLine, this));

        # Handle the Edit Line Button
        #@settings.element.on('click', '.edit-line', jQuery.proxy(handleEditLine, this));

        # Handle setting the Description
        #@settings.element.on('click', '#invoice-description-show', jQuery.proxy(handleSetDescription, this));

        #@settings.element.on('focusout', '#invoice-description', jQuery.proxy(handleLeaveDescription, this));

        # Sync the view
        #@settings.element.on('invoice-tax', jQuery.proxy(setTaxView, this));

window.invoiceFactory = new InvoiceFactory()
