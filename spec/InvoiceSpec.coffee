describe 'Invoice', () ->
  invoice = null
  element = $('<div id="online-invoice"></div>')

  to = 'TestTo'
  from = 'TestFrom'
  contact = 'TestContact'
  description = 'Test Description'
  date = new Date('2014-02-20')
  dueDate = new Date('2014-02-28')

  beforeEach ->
    values = {
      to: to,
      from: from,
      contact: contact,
      description: description,
      date: date,
      dueDate: dueDate,
      taxRate: 0.1
    }

    invoice = new Invoice(values, element)

  it 'should be constructed correctly', () ->
    expect(invoice.to).toBe to
    expect(invoice.from).toBe from
    expect(invoice.contact).toBe contact
    expect(invoice.description).toBe description
    expect(invoice.date.toDateString()).toBe date.toDateString()
    expect(invoice.dueDate.toDateString()).toBe dueDate.toDateString()

  it 'should have sensible defaults', () ->
    invoice = new Invoice({}, element)

    expect(invoice.to).toBe 'Client'
    expect(invoice.from).toBe 'HackerPlanet'
    expect(invoice.contact).toBe 'info@hackerpla.net'
    expect(invoice.description).toBe 'Client Side Invoicing'
    expect(invoice.date.toDateString()).toBe new Date().toDateString()
    dueDate = new Date(invoice.date + 7)
    expect(invoice.dueDate.toDateString()).toBe dueDate.toDateString()

  it 'should not add a line twice', () ->
    invoiceLine = new InvoiceLine(invoice)
    invoice.addLine(invoiceLine)
    expect(invoice.lines.length).toBe 1
    invoice.addLine(invoiceLine)
    expect(invoice.lines.length).toBe 1

  it 'should fire an event when a property is changed', () ->
    spyOn(element, 'trigger')
    invoice.description = 'The Description'
    expect(element.trigger)
      .toHaveBeenCalledWith('invoice-description', 'The Description')

  it 'should calculate the total correctly', () ->
    invoiceLine = new InvoiceLine(invoice, 'Line', 1, 11)
    invoice.addLine(invoiceLine)

    invoiceLine = new InvoiceLine(invoice, 'Line', 1, 22.3)
    invoice.addLine(invoiceLine)

    expect(invoice.getTotal(false).toFixed(2)).toBe '33.30'
    expect(invoice.getTotal(true).toFixed(2)).toBe '36.63'
    expect(invoice.total.toFixed(2)).toBe '36.63'

  it 'should calculate the tax correctly', () ->
    invoiceLine = new InvoiceLine(invoice, 'Line', 1, 10)
    invoice.addLine(invoiceLine)

    expect(invoice.tax).toBe 1

  it 'should update the total, tax and lines when a line is added', () ->
    spyOn(element, 'trigger').and.callThrough()

    invoiceLine = new InvoiceLine(invoice, 'Line', 1, 10)
    invoice.addLine(invoiceLine)
    expect(element.trigger).toHaveBeenCalledWith('invoice-total', 11)
    expect(element.trigger).toHaveBeenCalledWith('invoice-tax', 1)
    expect(element.trigger).toHaveBeenCalledWith('invoice-lines', [invoiceLine])
