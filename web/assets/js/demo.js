var invoice;
var seen;
var factory;

$(document).ready(function() {
    factory = invoiceFactory.init();

    invoice = factory.load('demo');
    if (invoice === null) {
        invoice = factory.generate();
    }

    $('[data-set]').on('change', function(evt) {
        var property = $(this).data('set').replace(/^invoice-/g, '');
        invoice[property] = $(this).val();
    });

    $('#online-invoice').on('invoice-change', function(evt, invoice) {
        factory.save('demo', invoice);
    });

    $('#theme-select').on('change', function(evt) {
        templatePath = './assets/templates/' + $(this).val() + '.js.html';

        tmplClear();

        invoiceFactory.setTemplatePath(templatePath);
        invoice.render();
    });
});
