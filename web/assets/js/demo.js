$(document).ready(function() {
    invoice = invoiceFactory.init().generate();

    $('[data-set]').on('change', function(evt) {
        var property = $(this).data('set').replace(/^invoice-/g, '');
        invoice[property] = $(this).val();
    });
});
