var OnlineInvoice = function(jQuery, config) {
    var settings = {
        currency: '$',
        invoiceElm: '#online-invoice',
        defaultFrom: 'Your Company',
        defaultTo: 'Clients Inc.'
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

    function handleSetFrom(evt) {
        jQuery(evt.target).replaceWith('<input type="text" class="" id="from">');
        jQuery('#from').focus();
    }

    function handleSetTo(evt) {
        jQuery(evt.target).replaceWith('<input type="text" class="" id="to">');
        jQuery('#to').focus();
    }

    function handleLeaveFrom(evt) {
        var value = jQuery('#from').val();
        if (value === '') {
            value = settings.defaultFrom;
        } else {
            this.invoiceElm.trigger('invoice-from', value);
        }
        $(evt.target).replaceWith('<span id="invoice-from">' + value + '</span>');
    }

    function handleLeaveTo(evt) {
        var value = jQuery('#to').val();
        if (value === '') {
            value = settings.defaultTo;
        } else {
            this.invoiceElm.trigger('invoice-to', value);
        }
        jQuery(evt.target).replaceWith('<span id="invoice-to">' + value + '</span>');
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

        // Handle setting the From and To
        this.invoiceElm.on('click', '#invoice-from', jQuery.proxy(handleSetFrom, this));
        this.invoiceElm.on('click', '#invoice-to', jQuery.proxy(handleSetTo, this));

        this.invoiceElm.on('focusout', '#from', jQuery.proxy(handleLeaveFrom, this));
        this.invoiceElm.on('focusout', '#to', jQuery.proxy(handleLeaveTo, this));

        // Set From and To
        this.invoiceElm.on('invoice-from', jQuery.proxy(function(evt, from) {
            this.setFrom(from);
        }, this));
        this.invoiceElm.on('invoice-to', jQuery.proxy(function(evt, to) {
            this.setTo(to);
        }, this));

        // Add the new Line
        this.invoiceElm.on('invoice-line', jQuery.proxy(function(evt, line) {
            this.addLine(line);
        }, this));
    }

    return {
        Invoice: {
            lines: [],
            currentLine: null,
            to: null,
            from: null
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
        },

        getFrom: function() {
            return this.Invoice.from;
        },

        setFrom: function(from) {
            this.Invoice.from = from;
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
