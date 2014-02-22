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

        @invoice = invoice
        @quantity = quantity ? 1
        @linePrice = linePrice ? 0
        @description = description ? ''
        @_currency = currency ? invoice.currency

        @_number = invoice.lines.length + 1

    getAmount: ->
        @_quantity * @_linePrice

class Invoice extends Base
    constructor: (values, @element) ->
        @accessor 'to', 'from', 'contact', 'description', 'date', 'dueDate', 'lines', 'total', 'tax'
        @readable 'currency', 'taxation'

        values ?= {}

        # Meta Info
        @_currency = values.currency ? '$'

        @_taxation = {
            rate: values.taxRate ? null,
            name: values.taxName ? 'Tax'
        }

        # Default Values
        @to = values.to ? 'Client'
        @from = values.from ? 'HackerPlanet'
        @contact = values.contact ? 'info@hackerpla.net'
        @description = values.description ? 'Client Side Invoicing'
        @date = values.date ? new Date()
        @dueDate = values.dueDate ? new Date().setDate(new Date().getDate() + 7)

        # Setup total, lines and Tax
        @total = 0
        @lines = []
        @addLine line for line in values.lines ? []

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

    render: () ->
        @element.html(tmpl('invoiceTemplate', this))

    renderForm: () ->
        currentLine = new InvoiceLine(this)
        formHtml = tmpl('invoiceLineFormTemplate', currentLine)
        @element.find('#invoice-lines-show').append(formHtml)

    renderTotal: (total) ->
        total ?= @total

        money_format(total)

    renderTax: (tax) ->
        tax ?= @tax

        money_format(tax)

    renderLines: (lines) ->
        lines ?= @lines

        jQuery('#invoice-lines').html('')

        lines = lines.reduce ((lines, line) ->
            lines += tmpl('invoiceLineTemplate', line)), ''

        # TODO Add tax line if necessary

        lines

    getTax: ->
        @tax = @_total * @_taxation.rate

    getTotal: (withTax = true) ->
        @_total = @lines?.reduce ((total, line) ->
            total + line.amount), 0
        @_total ?= 0

        if withTax
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
        @settings ?= {}
        @settings.element = jQuery(@settings.element ? '#online-invoice')

        @template_path = @settings.template_path ? './assets/templates/invoice.js.html'

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
        values ?= {}
        @invoice = new Invoice(values, @settings.element)

        @invoice.render()
        @invoice.renderForm()

        @invoice

    registerEvents: () ->
        # Handle the Confirm Line Button
        @settings.element.on('click', '#confirm-line', jQuery.proxy(@confirmLine, this));

        # Detect value changes
        @settings.element.on('change', 'input', jQuery.proxy(@formChange, this))

        # Handle the Edit Line Button
        @settings.element.on('click', '.edit-line', jQuery.proxy(@editLine, this));

        # Handle setting the Description
        #@settings.element.on('click', '#invoice-description-show', jQuery.proxy(handleSetDescription, this));

        #@settings.element.on('focusout', '#invoice-description', jQuery.proxy(handleLeaveDescription, this));

        # Sync the view
        #@settings.element.on('invoice-tax', jQuery.proxy(setTaxView, this));

    editLine: (evt) ->
        evt.preventDefault()

        line = jQuery(evt.target).closest('tr');

        number = parseFloat(line.find('.line-number').html());
        quantity = parseFloat(line.find('.line-quantity').html());
        description = line.find('.line-description').html();
        line_price = line.find('.line-linePrice').html();

        line_price = parseFloat(line_price.replace(/^[^0-9\.]*/, ''));

        lineObj = new InvoiceLine(number, quantity, description, line_price);

        editing = number;

        jQuery('#line-form').remove();

        form = format('invoiceLineFormTemplate', lineObj);
        line.replaceWith(form);

        return false;


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
