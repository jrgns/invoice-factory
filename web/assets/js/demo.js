var invoice;

$(document).ready(function() {
    invoice = invoiceFactory.init().generate();

    invoiceValues = localStorage['invoice'];
    if (invoiceValues !== null) {
        invoice.fromJSON(invoiceValues);
    }

    $('[data-set]').on('change', function(evt) {
        var property = $(this).data('set').replace(/^invoice-/g, '');
        invoice[property] = $(this).val();
    });

    $('#online-invoice').on('invoice-change', function(evt, invoice) {
        localStorage['invoice'] = JSON.stringify(invoice, checkCyclic);
    });

    $('#theme-select').on('change', function(evt) {
        templatePath = './assets/templates/' + $(this).val() + '.js.html';

        tmplClear();
        invoice = null;

        invoice = invoiceFactory.init( { templatePath: templatePath } ).generate();
    });
});

seen = [];
function checkCyclic(key, val) {
   if (typeof val == "object") {
        if (seen.indexOf(val) >= 0)
            return;
        seen.push(val);
    }
    return val;
}
