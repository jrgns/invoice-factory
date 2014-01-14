var OnlineInvoice = function(jQuery, config) {
    var settings = {
        currency: '$',
        invoiceElm: '#online-invoice',
        from: 'Your Company',
        to: 'Clients Inc.',
        contact: 'finance@yourcompany.com',
        date: formatDate(new Date()),
        due_date: formatDate(new Date()),
        description: 'Your most amazing invoice for our excellent service'
    };

    jQuery.extend(settings, config);

    var lineCount = 1;

    // Auxiliary Objects
    var InvoiceLine = function(quantity, description, line_price) {
        this.line = lineCount;
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
        jQuery('#line-form').before(line);
    }

    // Handle Events
    function handleConfirmLine(evt) {
        evt.preventDefault();

        $('#description').parent('td').removeClass('has-error');

        var quantity = $('#quantity').val();
        var description = $('#description').val();
        var line_price = $('#line_price').val();

        if (description !== '') {
            line = new InvoiceLine(quantity, description, line_price);
            // Trigger the event
            this.invoiceElm.trigger('invoice-line', line);
        } else {
            $('#description').parent('td').addClass('has-error');
        }

        return false;
    }

    function handleFormChange(evt) {
        var quantity = parseFloat($('#quantity').val());
        var line_price = parseFloat($('#line_price').val());
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
    function initInvoice(template, status, xhr) {
        jQuery('body').append(template);

        this.invoiceElm.html(format('invoiceTemplate', {}));

        jQuery.proxy(initLines, this)();

        jQuery.proxy(initEvents, this)();
    }

    function initLines() {
        jQuery.each(this.getLines(), function(key, line) {
            showLine(line);
        });

        // Initial Line
        line = new InvoiceLine();
        line.line_price = formatMoney(line.line_price);
        line.amount = formatMoney(line.amount);
        form = format('invoiceLineFormTemplate', line);
        jQuery('#online-invoice tbody').append(form);

        this.calculateTotal();
    }

    function initEvents() {
        // Detect value changes
        jQuery('#online-invoice').on('change', 'input', jQuery.proxy(handleFormChange, this));

        // Handle the Confirm Line Button
        jQuery('#online-invoice').on('click', '#confirm-line', jQuery.proxy(handleConfirmLine, this));

        // Handle setting the Description
        this.invoiceElm.on('click', '#invoice-description-show', jQuery.proxy(handleSetDescription, this));

        this.invoiceElm.on('focusout', '#invoice-description', jQuery.proxy(handleLeaveDescription, this));

        // Sync the view
        this.invoiceElm.on('invoice-description invoice-from invoice-date invoice-due_date invoice-to', setElement);

        // Add the new Line
        this.invoiceElm.on('invoice-line', jQuery.proxy(function(evt, line) {
            this.addLine(line);
        }, this));
    }

    function setElement(id, value) {
        id = id.type ? id.type : id;
        jQuery('#' + id + '-show').html(value);
    }

    return {
        Invoice: {
            lines: [],
            currentLine: null,
            to: settings.to,
            from: settings.from,
            description: settings.description,
            date: settings.date,
            due_date: settings.due_date
        },

        invoiceElm: jQuery(settings.invoiceElm),

        init: function() {
            // Get the templates
            jQuery.get('./assets/templates/invoice.js.html', jQuery.proxy(initInvoice, this), 'html');
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

        getLines: function() {
            return this.Invoice.lines;
        },

        addLine: function(line) {
            lineCount++;
            jQuery('#line-number').html(lineCount + '.');
            this.Invoice.lines.push(line);
            showLine(line);

            // reset
            $('#description').val('');
            $('#line_price').val('0.00');
            $('#quantity').val('1');

            jQuery.proxy(handleFormChange, this)();
        },

        calculateTotal: function() {
            var total = 0;
            jQuery.each(this.getLines(), function(key, line) {
                total += parseFloat(line.amount);
            });

            var values = { total: formatMoney(total) };
            template = format('invoiceTotalTemplate', values);
            jQuery('#invoice-total').html(template);
        }
    };
}(jQuery);
