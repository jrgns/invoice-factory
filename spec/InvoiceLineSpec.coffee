element = null
invoice = null

describe 'InvoiceLine', () ->
  description = 'The Description'
  number = 1
  quantity = 12.3
  linePrice = 3
  currency = 'BWP'
  invoiceLine = null

  beforeEach ->
    element = $('<div id="invoice-factory"></div>')
    invoice = new Invoice( { }, element )

    invoiceLine = new InvoiceLine(
      number, description, quantity, linePrice, currency, invoice
    )

  it 'should be constructed correctly', () ->
    expect(invoiceLine.number).toBe number
    expect(invoiceLine.description).toBe description
    expect(invoiceLine.quantity).toBe quantity
    expect(invoiceLine.linePrice).toBe linePrice
    expect(invoiceLine.currency).toBe currency
    expect(invoiceLine.invoice).toBe invoice

  it 'should have sensible defaults', () ->
    invoiceLine = new InvoiceLine()
    expect(invoiceLine.number).toBe 1
    expect(invoiceLine.description).toBe ''
    expect(invoiceLine.quantity).toBe 1
    expect(invoiceLine.linePrice).toBe 0
    expect(invoiceLine.currency).toBe '$'
    expect(invoiceLine.invoice).toBe null

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

    anotherLine = new InvoiceLine(
      invoice, description, quantity, linePrice, currency, invoice
    )
    invoice.addLine(anotherLine)
    expect(anotherLine.number).toBe 2

    anotherLine = new InvoiceLine(invoice, description, quantity, linePrice)
    invoice.addLine(anotherLine)
    expect(anotherLine.number).toBe 3

  it 'should not allow it\'s number to be set', () ->
    invoice.number = 3
    expect(invoiceLine.number).toBe 1

  it 'should default to the invoice\'s currency', () ->
    invoice = new Invoice( { currency: 'ZAR' }, element )
    anotherLine = new InvoiceLine(
      null, null, null, null, null, invoice
    )
    expect(anotherLine.currency).toBe 'ZAR'
