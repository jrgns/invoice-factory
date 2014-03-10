var invoice;

$(document).ready(function() {
    invoice = invoiceFactory.init().generate();

    $('[data-set]').on('change', function(evt) {
        var property = $(this).data('set').replace(/^invoice-/g, '');
        invoice[property] = $(this).val();
    });

    $('#theme-select').on('change', function(evt) {
        templatePath = './assets/templates/' + $(this).val() + '.js.html';

        tmplClear();
        invoice = null;

        invoice = invoiceFactory.init( { templatePath: templatePath } ).generate();
    });
});
