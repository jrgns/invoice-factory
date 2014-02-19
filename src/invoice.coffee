Array.prototype.each = Array.prototype.forEach

class Base

    fireEvent: (@name, @data) ->

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

class InvoiceGenerator extends Base
    constructor: (@jQuery) ->

    init: (@settings) ->
        @settings.element = @jQuery(@settings?.element ? '#online-invoice')

        new Invoice(@settings)
