class Base
  fireEvent: (@name, @data) ->

  readable: (args...) ->
    object = if @__proto__ then @__proto__ else this
    args.forEach (arg) ->
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
    args.forEach (arg) ->
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
