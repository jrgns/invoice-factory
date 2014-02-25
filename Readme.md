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

## Invoice

### Properties

* to
* from
* contact
* description
* date
* dueDate
* lines

### Readonly Properties

* currency
* taxation
* total
* tax

### Methods

* render
* renderForm
* renderLines
* setLines
* addLine

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

## InvoiceLine

### Methods

* init
* generate

API
---

* init()
* setTo(to)
* getTo()
* setFrom(from)
* getFrom()
* setDescription(description)
* getDescription()
* setDate(date)
* getDate()
* setDueDate(due_date)
* getDueDate()
* getLines()
* addLine(line)
* calculateTotal()

Events
------

* invoice-line
* invoice-description
* invoice-from
* invoice-to
* invoice-date
* invoice-due_date
