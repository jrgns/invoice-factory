var OnlineInvoice = function(jQuery, config) {
    var settings = {
        currency: '$',
        invoiceElm: '#online-invoice'
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

    function handleNewLine(evt, line) {
        this.addLine(line);
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

        // Add the new Line
        this.invoiceElm.on('invoice-line', jQuery.proxy(handleNewLine, this));
    }

    return {
        Invoice: {
            lines: [],
            currentLine: null
        },

        invoiceElm: jQuery(settings.invoiceElm),

        init: function() {
            // Get the templates
            jQuery.get('./assets/templates/invoice.js.html', jQuery.proxy(initInvoice, this), 'html');
        },

        getLines: function() {
            return this.Invoice.lines;
        },

        addLine: function(line) {
            lineCount++;
            jQuery('#line-number').html(lineCount + '.');
            this.Invoice.lines.push(line);
            showLine(line);
            this.calculateTotal();

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
