## Basic Usage

    <script src="../src/templating.js"></script>
    <script src="../src/invoice.js"></script>
    <script>
    $(document).ready(function() {
        values = {
            taxRate: 0.14
        }
        invoice = invoiceFactory.init().generate(values);
    })
    </script>

## Editing

Online diting of the various properties can easily be achieved in two steps.

Firstly, uncomment (or add) the following JavaScript:

    $('[data-set]').on('change', function(evt) {
        var property = $(this).data('set').replace(/^invoice-/g, '');
        invoice[property] = $(this).val();
    });

Secondly, add form elements with `data-set` attributes that start with `invoice-` and is followed by the invoice property you want to make editable. These form elements can be anywhere in the HTML.

As an example, if you want to make the description editable, add this input:

    <input data-set="invoice-description" type="text">

## Objects

### InvoiceFactory

#### Properties

* templatePath

#### Methods

* init(settings)
* generate(values)
* getTemplatePath()
* setTemplatePath(templatePath)

### Invoice

#### Properties

* to
* from
* contact
* description
* date
* dueDate
* lines

#### Readonly Properties

* currency
* taxation
* total
* tax

#### Methods

* render()
* renderForm()
* renderLines()
* setLines()
* addLine()
* getLine(number)

* getTo()
* setTo(to)
* getFrom()
* setFrom(from)
* getContact()
* setContact(contact)
* getDescription()
* setDescription(description)
* getDate()
* setDate(date)
* getDueDate()
* setDueDate(dueDate)
* getLines()
* setLines(lines)

* getCurrency()
* getTaxation()
* getTotal()
* getTax()

### InvoiceLine

#### Properties

* invoice
* description
* quantity
* linePrice

#### Readonly Properties

* amount
* number
* currency

#### Methods

* getInvoice()
* setInvoice(invoice)
* getDescription()
* setDescription(description)
* getQuantity()
* setQuantity(quantity)
* getLinePrice()
* setLinePrice(linePrice)

* getAmount()
* getNumber()
* getCurrency()

Events
------

* invoice-line
* invoice-description
* invoice-from
* invoice-to
* invoice-date
* invoice-due_date
