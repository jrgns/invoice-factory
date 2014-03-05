class TestBase extends Base
  constructor: ->
    @accessor('cap')

  setCap: (value) ->
    @_cap = value

  getCap: () ->
    @_cap

describe 'Base', () ->

  base = null

  beforeEach ->
    base = new TestBase()
    base.readable('readableProp')
    base.accessor('accessorProp')

    spyOn(base, 'fireEvent')
    spyOn(base, 'getCap')
    spyOn(base, 'setCap')

  it 'should not set readable', () ->
    base.readableProp = 'set'
    expect(base.readableProp).not.toBe 'set'

  it 'should set and get accessors', () ->
    base.accessorProp = 'set'
    expect(base.accessorProp).toBe 'set'

  it 'should fire events when accessors are set', () ->
    base.accessorProp = 'fireEvent'
    expect(base.fireEvent).toHaveBeenCalledWith('accessorProp', 'fireEvent')

  it 'should use the getCap method when available', () ->
    base.cap
    expect(base.getCap).toHaveBeenCalled()

  it 'should use the setCap method when available', () ->
    date = new Date()
    base.cap = date
    expect(base.setCap).toHaveBeenCalledWith(date)
