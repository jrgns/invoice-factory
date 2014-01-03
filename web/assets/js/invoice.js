var OnlineInvoice = function(jQuery, config) {
    var settings = {
        currency: '$'
    };

    jQuery.extend(settings, config);

    var lineCount = 1;

    var InvoiceLine = function(quantity, description, line_price, amount) {
        this.line = lineCount;
        this.quantity = quantity || 1;
        this.description = description || '';
        this.line_price = line_price || 0;
        this.amount = amount || 0;
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

            // Set up the events
            jQuery('#confirm-line').on('click', function(evt) {
                evt.preventDefault();

                var quantity = $('#quantity').val();
                var description = $('#description').val();
                var line_price = $('#line_price').val();
                var amount = $('#amount').val();

                line = new InvoiceLine(quantity, description, line_price, amount);
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
        },

        showLine: function(line) {
            line.line_price = formatMoney(line.line_price);
            line.amount = formatMoney(line.amount);
            line = format('invoiceLine', line);
            jQuery('#online-invoice tbody').append(line);
        }
    };
}(jQuery);

OnlineInvoice.init();
