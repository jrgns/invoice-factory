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

                @fireEvent 'invoice-' + arg, value

class InvoiceLine extends Base
    constructor: (invoice, number, quantity, description, line_price) ->
        @accessor 'invoice', 'number', 'quantity', 'description', 'line_price'
        @readable 'amount'

        @invoice = invoice
        @quantity = quantity
        @line_price = line_price
        @description = description

        @amount = @quantity * @line_price
        @number ?= invoice.lines.length + 1

class Invoice extends Base

    element = null
    taxation = { rate: null, name: null }

    constructor: (@settings) ->
        element = @settings.element

        taxation.rate = @settings?.taxRate ? null
        taxation.name = @settings?.taxName ? null

        @accessor 'to'
        @accessor 'from'
        @accessor 'contact'
        @accessor 'description'
        @accessor 'date'
        @accessor 'dueDate'
        @accessor 'lines'
        @accessor 'tax'
        @accessor 'total'

    fireEvent: (@name, @data) ->
        element.trigger(@name, @data)

    # getTotal: (@withTax) ->
    #     if @withTax
    #         @_total * (1 + taxation.rate)
    #     else
    #         @_total

class InvoiceFactory extends Base
    constructor: (@jQuery) ->
        @accessor 'template_path'

    init: (@settings) ->
        jQuery = @jQuery

        @settings.element = jQuery(@settings?.element ? '#online-invoice')

        # Check and remove the template path from settings
        @template_path = @settings?.template_path ? './assets/templates/invoice.js.html'
        if @settings?.template_path?
            delete @settings.template_path

        # Retrieve the templates
        jQuery.ajax({
            url: @template_path,
            success: (template, xhr, status) -> jQuery('body').append(template);,
            dataType: 'html',
            async: false
        })

        new Invoice(@settings)

    registerEvents: (element) ->
        element.on('change', 'input', @jQuery.proxy(@handleFormChange, this))

window.invoiceFactory = new InvoiceFactory(jQuery)
