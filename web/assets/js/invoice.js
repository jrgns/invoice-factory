var OnlineInvoice = function(jQuery, config) {
    var settings = {
        currency: '$'
    };

    jQuery.extend(settings, config);

    var lineCount = 1;

    var InvoiceLine = function(quantity, description, line_price) {
        this.line = lineCount;
        this.quantity = parseFloat(quantity) || 1;
        this.description = description || '';
        this.line_price = parseFloat(line_price) || 0;
        this.amount = this.quantity * this.line_price;
        console.log(this);
    };

    function format(template, values) {
        template = $('#' + template).html();
        var allValues = jQuery.extend({}, settings);
        jQuery.extend(allValues, values);
        jQuery.each(allValues, function(key, value) {
            var regex = new RegExp('{{ ' + key + ' }}', 'gi');
            template = template.replace(regex, value);
        });
        return template;
    }

    function formatMoney(number) {
        var parts = parseFloat(number).toFixed(2).toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    return {
        Invoice: {
            lines: [],
            currentLine: null
        },

        init: function() {
            var self = this;

            console.log('starting up...');
            jQuery.each(this.getLines(), function(key, line) {
                this.showLine(line);
            });

            // Initial Line
            line = new InvoiceLine();
            line.line_price = formatMoney(line.line_price);
            line.amount = formatMoney(line.amount);
            form = format('invoiceLineForm', line);
            jQuery('#online-invoice tbody').append(form);

            self.calculateTotal();

            // Detect value changes
            jQuery('#online-invoice').on('change', 'input', function(evt) {
                var quantity = parseFloat($('#quantity').val());
                var line_price = parseFloat($('#line_price').val());
                var amount = quantity * line_price;

                // Format and set the amounts
                $('#amount').val(formatMoney(amount));
                $('#line_price').val(formatMoney(line_price));

                self.calculateTotal();
            });

            // Add the new line
            jQuery('#online-invoice').on('click', '#confirm-line', function(evt) {
                evt.preventDefault();

                var quantity = $('#quantity').val();
                var description = $('#description').val();
                var line_price = $('#line_price').val();

                line = new InvoiceLine(quantity, description, line_price);
                self.addLine(line);

                return false;
            });
        },

        getLines: function() {
            return this.Invoice.lines;
        },

        addLine: function(line) {
            lineCount++;
            this.Invoice.lines.push(line);
            this.showLine(line);
            this.calculateTotal();
        },

        showLine: function(line) {
            line.line_price = formatMoney(line.line_price);
            line.amount = formatMoney(line.amount);
            line = format('invoiceLine', line);
            jQuery('#online-invoice tbody').append(line);
        },

        calculateTotal: function() {
            var total = 0;
            jQuery.each(this.getLines(), function(key, line) {
                total += parseFloat(line.amount);
            });

            var values = { total: formatMoney(total) };
            template = format('invoiceTotal', values);
            jQuery('#invoice-total').html(template);
        }
    };
}(jQuery);

OnlineInvoice.init();
