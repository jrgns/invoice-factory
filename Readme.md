# InvoiceFactory

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

## Theming

The invoice uses the `web\assets\templates\invoice.js.html` as it's default template. It contains three template elements to define the invoice, invoice line and line form. These can be modified in the file itself, or a new template file created and then passed to the InvoiceFactory init method:

    invoice = invoiceFactory.init({ templatePath: './assets/templates/newTemplate.js.html' }).generate();

## Editing

Online editing of the various properties can easily be achieved in two steps.

Firstly, uncomment (or add) the following JavaScript:

    $('[data-set]').on('change', function(evt) {
        var property = $(this).data('set').replace(/^invoice-/g, '');
        invoice[property] = $(this).val();
    });

Secondly, add form elements with `data-set` attributes that start with `invoice-` and is followed by the invoice property you want to make editable. These form elements can be anywhere in the HTML.

As an example, if you want to make the description editable, add this input:

    <input data-set="invoice-description" type="text">

## Events

Events are fired everytime the property of an Invoice object is changed. This can be used to add custom functionality to the invoice. The event is fired on the invoice element, typically `$('#invoice-factory')`. Each event is prefaced with 'invoice-', followed by the property name. The new value of the property is passed down as a second parameter to the event handler.

As an example:

    $('#invoice-factory').on('invoice-to', function(evt, newValue) {
        alert("We're now sending the invoice to " + newValue);
    });

## Objects

### InvoiceFactory

#### Properties

* templatePath

#### Methods

* init(settings)
* generate(values)
* load(identifier)
* save(identifier, invoice)
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
