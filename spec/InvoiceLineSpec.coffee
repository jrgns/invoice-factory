invoiceCurrency = 'ZAR'
element = null
invoice = null

describe 'InvoiceLine', () ->
  description = 'The Description'
  quantity = 12.3
  linePrice = 3
  currency = 'BWP'
  invoiceLine = null

  beforeEach ->
    element = $('<div id="online-invoice"></div>')
    invoice = new Invoice( { currency: invoiceCurrency }, element )

    invoice.lines = []
    invoiceLine = new InvoiceLine(
      invoice, description, quantity, linePrice, currency
    )

  it 'should be constructed correctly', () ->
    expect(invoiceLine.invoice).toBe invoice
    expect(invoiceLine.description).toBe description
    expect(invoiceLine.quantity).toBe quantity
    expect(invoiceLine.linePrice).toBe linePrice
    expect(invoiceLine.currency).toBe currency

  it 'should get it\s currency from the invoice if not set', () ->
    invoiceLine = new InvoiceLine(invoice, description, quantity, linePrice)
    expect(invoiceLine.currency).toBe invoiceCurrency

  it 'should have sensible defaults', () ->
    invoiceLine = new InvoiceLine(invoice)
    expect(invoiceLine.description).toBe ''
    expect(invoiceLine.quantity).toBe 1
    expect(invoiceLine.linePrice).toBe 0

  it 'should calculate it\s amount correctly', () ->
    expect(invoiceLine.amount).toBe quantity * linePrice

  it 'should not be added twice', () ->
    invoice.addLine(invoiceLine)
    expect(invoiceLine.number).toBe 1
    invoice.addLine(invoiceLine)
    expect(invoiceLine.number).toBe 1

  it 'should calculate it\s line number correctly', () ->
    invoice.addLine(invoiceLine)
    expect(invoiceLine.number).toBe 1

    anotherLine = new InvoiceLine(invoice, description, quantity, linePrice)
    invoice.addLine(anotherLine)
    expect(anotherLine.number).toBe 2

    anotherLine = new InvoiceLine(invoice, description, quantity, linePrice)
    invoice.addLine(anotherLine)
    expect(anotherLine.number).toBe 3

  it 'should not allow it\'s number to be set', () ->
    invoice.number = 3
    expect(invoiceLine.number).toBe 1
