var OnlineInvoice = function(jQuery, config) {
    var settings = {
        currency: '$',
        invoiceElm: '#online-invoice'
    };

    jQuery.extend(settings, config);
    // Get the templates
    jQuery.ajax({
        url: './assets/templates/invoice.js.html',
        success: function(template, xhr, status) { jQuery('body').append(template); },
        dataType: 'html',
        async: false
    });

    var lineCount = 1;

    var editing = false;

    // Auxiliary Objects
    var InvoiceLine = function(number, quantity, description, line_price) {
        this.number = number || lineCount;
        this.quantity = parseFloat(quantity) || 1;
        this.description = description || '';
        this.line_price = parseFloat(line_price) || 0;
        this.amount = this.quantity * this.line_price;
    };

    // Templating
    function format(template, values) {
        template = jQuery('#' + template).html();
        var allValues = jQuery.extend({}, settings);
        jQuery.extend(allValues, values);
        jQuery.each(allValues, function(key, value) {
            var regex = new RegExp('{{ ' + key + ' }}', 'gi');
            template = template.replace(regex, value);
        });
        return template;
    }

    // Utility
    function formatMoney(number) {
        var parts = parseFloat(number).toFixed(2).toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    function formatDate(date) {
        var d = new Date(date);
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1; //Months are zero based
        curr_month = curr_month < 10 ? '0' + curr_month : curr_month;
        var curr_year = d.getFullYear();
        return curr_date + "-" + curr_month + "-" + curr_year;
    }

    function showLine(line) {
        line.line_price = formatMoney(line.line_price);
        line.amount = formatMoney(line.amount);
        line = format('invoiceLineTemplate', line);

        jQuery('#line-form').replaceWith(line);
    }

    function showLineForm() {
        line = new InvoiceLine();
        line.line_price = formatMoney(line.line_price);
        line.amount = formatMoney(line.amount);

        form = format('invoiceLineFormTemplate', line);
        this.invoiceElm.find('tbody').append(form);
    }

    // Handle Events
    function handleConfirmLine(evt) {
        evt.preventDefault();

        jQuery('#description').parent('td').removeClass('has-error');

        var quantity = jQuery('#quantity').val();
        var description = jQuery('#description').val();
        var line_price = jQuery('#line_price').val();
        var number = editing ? editing : null;

        if (description !== '') {
            line = new InvoiceLine(number, quantity, description, line_price);
            // Trigger the event
            this.invoiceElm.trigger('invoice-line', line);

            editing = false;
        } else {
            jQuery('#description').parent('td').addClass('has-error');
        }

        return false;
    }

    function handleEditLine(evt) {
        var line = jQuery(evt.target).parents('tr').first();

        var number = parseFloat(line.find('.line-number').html());
        var quantity = parseFloat(line.find('.line-quantity').html());
        var description = line.find('.line-description').html();
        var line_price = line.find('.line-line_price').html();
        line_price = parseFloat(line_price.replace(/^[^0-9]*/, ''));

        var lineObj = new InvoiceLine(number, quantity, description, line_price);

        editing = number;

        jQuery('#line-form').remove();

        form = format('invoiceLineFormTemplate', lineObj);
        line.replaceWith(form);

        return false;
    }

    function handleFormChange(evt) {
        var quantity = parseFloat(jQuery('#quantity').val());
        var line_price = parseFloat(jQuery('#line_price').val());
        var amount = quantity * line_price;

        // Format and set the amounts
        $('#amount').val(formatMoney(amount));
        $('#line_price').val(formatMoney(line_price));

        this.calculateTotal();
    }

    function handleSetDescription(evt) {
        jQuery('#invoice-description-show').hide();
        jQuery(evt.target).after('<textarea class="" id="invoice-description">' + jQuery('#invoice-description-show').html().trim() + '</textarea>');
        jQuery('#invoice-description').focus();
    }

    function handleLeaveDescription(evt) {
        var value = jQuery('#invoice-description').val();
        this.invoiceElm.trigger('invoice-description', value);
        jQuery('#invoice-description-show').show();
        jQuery(evt.target).remove();
    }

    // Init Methods
    function initLines() {
        jQuery.each(this.getLines(), function(key, line) {
            showLine(line);
        });

        this.calculateTotal();
    }

    function initTax() {
        jQuery.proxy(setTaxView, this)();
    }

    function initEvents() {
        // Detect value changes
        this.invoiceElm.on('change', 'input', jQuery.proxy(handleFormChange, this));

        // Handle the Confirm Line Button
        this.invoiceElm.on('click', '#confirm-line', jQuery.proxy(handleConfirmLine, this));

        // Handle the Edit Line Button
        this.invoiceElm.on('click', '.edit-line', jQuery.proxy(handleEditLine, this));

        // Handle setting the Description
        this.invoiceElm.on('click', '#invoice-description-show', jQuery.proxy(handleSetDescription, this));

        this.invoiceElm.on('focusout', '#invoice-description', jQuery.proxy(handleLeaveDescription, this));

        // Sync the view
        this.invoiceElm.on('invoice-description invoice-from invoice-date invoice-due_date invoice-to invoice-contact invoice-tax', jQuery.proxy(setElement, this));
        this.invoiceElm.on('invoice-tax', jQuery.proxy(setTaxView, this));

        // Add the new Line
        this.invoiceElm.on('invoice-line', jQuery.proxy(function(evt, line) {
            this.addLine(line);
        }, this));
    }

    function setElement(id, value) {
        id = id.type ? id.type : id;
        jQuery('#' + id + '-show').html(value);
    }

    function setTaxView() {
        if (this.Invoice.tax) {
            var values = {
                rate: formatMoney(this.Invoice.tax.rate * 100),
                amount: formatMoney(OnlineInvoice.getTaxAmount()),
                name: this.Invoice.tax.name
            };
            var taxLine = format('invoiceTaxTemplate', values);

            if (jQuery('#invoice-tax').length === 0) {
                // Add the line
                this.invoiceElm.find('table').after(taxLine);
            } else {
                this.invoiceElm.find('#invoice-tax').replaceWith(taxLine);
            }
        }
    }

    return {
        Invoice: {
            lines: [],
            currentLine: null,
            to: "Clients, Inc.",
            from: "My Company",
            description: "Online Invoice Script",
            date: formatDate    (new Date()),
            due_date: formatDate(new Date()),
            contact: 'finance@yourcompany.com',
            tax: null
        },

        invoiceElm: jQuery(settings.invoiceElm),

        init: function(values) {
            jQuery.extend(this.Invoice, values);

            this.invoiceElm.html(format('invoiceTemplate', this.Invoice));

            jQuery.proxy(initLines, this)();

            jQuery.proxy(showLineForm, this)();

            jQuery.proxy(initEvents, this)();

            jQuery.proxy(initTax, this)();
        },

        getTo: function() {
            return this.Invoice.to;
        },

        setTo: function(to) {
            this.Invoice.to = to;
            this.invoiceElm.trigger('invoice-to', to);
        },

        getFrom: function() {
            return this.Invoice.from;
        },

        setFrom: function(from) {
            this.Invoice.from = from;
            this.invoiceElm.trigger('invoice-from', from);
        },

        getContact: function() {
            return this.Invoice.contact;
        },

        setContact: function(contact) {
            this.Invoice.contact = contact;
            this.invoiceElm.trigger('invoice-contact', contact);
        },

        getDescription: function() {
            return this.Invoice.description;
        },

        setDescription: function(description) {
            this.Invoice.description = description;
            this.invoiceElm.trigger('invoice-description', description);
        },

        getDate: function() {
            return this.Invoice.date;
        },

        setDate: function(date) {
            this.Invoice.date = date;
            this.invoiceElm.trigger('invoice-date', date);
        },

        getDueDate: function() {
            return this.Invoice.due_date;
        },

        setDueDate: function(due_date) {
            this.Invoice.due_date = due_date;
            this.invoiceElm.trigger('invoice-due_date', due_date);
        },

        getTax: function() {
            return this.Invoice.tax;
        },

        setTax: function(tax) {
            this.Invoice.tax = tax;
            this.invoiceElm.trigger('invoice-tax', tax);
        },

        getLines: function() {
            return this.Invoice.lines;
        },

        addLine: function(line) {
            if (editing === false) {
                lineCount++;
                jQuery('#line-number').html(lineCount + '.');
            }
            this.Invoice.lines[line.number - 1] = line;
            showLine(line);

            // reset
            jQuery.proxy(showLineForm, this)();

            jQuery.proxy(handleFormChange, this)();
        },

        getTotal: function(withTax) {
            var total = 0;
            jQuery.each(this.getLines(), function(key, line) {
                total += parseFloat(line.amount);
            });

            // Calculate Tax
            if (this.Invoice.tax && withTax) {
                total += this.getTaxAmount();
            }

            return total;
        },

        getTaxAmount: function() {
            if (this.Invoice.tax && this.Invoice.tax.rate) {
                return this.getTotal(false) * this.Invoice.tax.rate;
            } else {
                return 0;
            }
        },

        calculateTotal: function() {
            var total = this.getTotal(true);

            var values = { total: formatMoney(total) };
            template = format('invoiceTotalTemplate', values);
            jQuery('#invoice-total').html(template);

            jQuery.proxy(setTaxView, this)();
        }
    };
}(jQuery, config);
