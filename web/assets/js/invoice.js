var Base, Invoice, InvoiceFactory, InvoiceLine,
  __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Base = (function() {
  function Base() {}

  Base.prototype.fireEvent = function(name, data) {
    this.name = name;
    this.data = data;
  };

  Base.prototype.readable = function() {
    var args, object;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    object = this.__proto__ ? this.__proto__ : this;
    return args.forEach(function(arg) {
      var cap;
      if (Object.getOwnPropertyDescriptor(object, arg)) {
        return;
      }
      cap = "" + (arg[0].toUpperCase()) + arg.slice(1);
      return Object.defineProperty(object, arg, {
        get: function() {
          if (("get" + cap) in this) {
            return this["get" + cap]();
          } else {
            return this['_' + arg];
          }
        }
      });
    });
  };

  Base.prototype.accessor = function() {
    var args, object;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    object = this.__proto__ ? this.__proto__ : this;
    return args.forEach(function(arg) {
      var cap;
      if (Object.getOwnPropertyDescriptor(object, arg)) {
        return;
      }
      cap = "" + (arg[0].toUpperCase()) + arg.slice(1);
      return Object.defineProperty(object, arg, {
        get: function() {
          if (("get" + cap) in this) {
            return this["get" + cap]();
          } else {
            return this['_' + arg];
          }
        },
        set: function(value) {
          if (("set" + cap) in this) {
            this["set" + cap](value);
          } else {
            this['_' + arg] = value;
          }
          return this.fireEvent(arg, value);
        }
      });
    });
  };

  return Base;

})();

Invoice = (function(_super) {
  __extends(Invoice, _super);

  function Invoice(values, element) {
    var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
    this.element = element;
    this.accessor('to', 'from', 'contact', 'description', 'date', 'dueDate', 'lines', 'currentLine');
    this.readable('currency', 'taxation', 'total', 'tax');
    if (values == null) {
      values = {};
    }
    this._currency = (_ref = values.currency) != null ? _ref : '$';
    this._taxation = {
      rate: (_ref1 = values.taxRate) != null ? _ref1 : null,
      name: (_ref2 = values.taxName) != null ? _ref2 : 'Tax'
    };
    this._to = (_ref3 = values.to) != null ? _ref3 : 'Client';
    this._from = (_ref4 = values.from) != null ? _ref4 : 'HackerPlanet';
    this._contact = (_ref5 = values.contact) != null ? _ref5 : 'info@hackerpla.net';
    this._description = (_ref6 = values.description) != null ? _ref6 : 'Client Side Invoicing';
    this._date = (_ref7 = values.date) != null ? _ref7 : new Date();
    this._dueDate = (_ref8 = values.dueDate) != null ? _ref8 : new Date(this._date + 7);
    this._total = 0;
    this._lines = [];
  }

  Invoice.prototype.fireEvent = function(name, data) {
    var cap, template, vars;
    this.element.trigger('invoice-' + name, data);
    template = jQuery.parseHTML(jQuery('#invoiceTemplate').html());
    template = jQuery(template).find('[data-show="invoice-' + name + '"]').text();
    if (template) {
      cap = "" + (name[0].toUpperCase()) + name.slice(1);
      if (("render" + cap) in this) {
        data = this["render" + cap](data);
      } else {
        vars = {};
        vars[name] = data;
        data = tmpl(template, vars);
      }
    }
    return jQuery('[data-show="invoice-' + name + '"]').html(data);
  };

  Invoice.prototype.render = function() {
    return this.element.html(tmpl('invoiceTemplate', this));
  };

  Invoice.prototype.renderForm = function() {
    var formHtml;
    this.currentLine = new InvoiceLine(this);
    formHtml = tmpl('invoiceLineFormTemplate', this.currentLine);
    return this.element.find('[data-show="invoice-lines"]').append(formHtml);
  };

  Invoice.prototype.renderLines = function(lines) {
    if (lines == null) {
      lines = this.lines;
    }
    jQuery('#invoice-lines').html('');
    return lines.reduce((function(lines, line) {
      return lines += tmpl('invoiceLineTemplate', line);
    }), '');
  };

  Invoice.prototype.getTax = function() {
    return this._tax = this._total * this._taxation.rate;
  };

  Invoice.prototype.getTotal = function(withTax) {
    var _ref;
    if (withTax == null) {
      withTax = true;
    }
    this._total = (_ref = this.lines) != null ? _ref.reduce((function(total, line) {
      return total + line.amount;
    }), 0) : void 0;
    if (this._total == null) {
      this._total = 0;
    }
    if (withTax) {
      return this._total + this.getTax();
    } else {
      return this._total;
    }
  };

  Invoice.prototype.setLines = function(lines) {
    var line, _i, _len, _ref, _results;
    this._lines = [];
    _ref = lines != null ? lines : [];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      _results.push(this.addLine(line));
    }
    return _results;
  };

  Invoice.prototype.addLine = function(line) {
    if (__indexOf.call(this._lines, line) < 0) {
      this._lines.push(line);
    }
    this.fireEvent('lines', this.lines);
    this.fireEvent('total', this.total);
    this.fireEvent('tax', this.tax);
    return this;
  };

  Invoice.prototype.getLine = function(number) {
    var theLine;
    theLine = null;
    this.lines.forEach(function(line) {
      if (line.number === number) {
        return theLine = line;
      }
    });
    return theLine;
  };

  return Invoice;

})(Base);

InvoiceFactory = (function(_super) {
  __extends(InvoiceFactory, _super);

  function InvoiceFactory() {
    this.accessor('templatePath');
  }

  InvoiceFactory.prototype.init = function(settings) {
    var _ref, _ref1;
    this.settings = settings;
    if (this.settings == null) {
      this.settings = {};
    }
    this.settings.element = jQuery((_ref = this.settings.element) != null ? _ref : '#online-invoice');
    this._templatePath = (_ref1 = this.settings.templatePath) != null ? _ref1 : './assets/templates/invoice.js.html';
    jQuery.ajax({
      url: this.templatePath,
      success: function(template, xhr, status) {
        return jQuery('body').append(template);
      },
      dataType: 'html',
      async: false
    });
    this.registerEvents();
    return this;
  };

  InvoiceFactory.prototype.generate = function(values) {
    var invoice;
    if (values == null) {
      values = {};
    }
    invoice = new Invoice(values, this.settings.element);
    invoice.render();
    invoice.renderForm();
    return invoice;
  };

  InvoiceFactory.prototype.registerEvents = function() {
    this.settings.element.on('click', '#confirm-line', jQuery.proxy(this.confirmLine, this));
    this.settings.element.on('change', 'input', jQuery.proxy(this.formChange, this));
    return this.settings.element.on('click', '.edit-line', jQuery.proxy(this.editLine, this));
  };

  InvoiceFactory.prototype.editLine = function(evt) {
    var form, line, number;
    evt.preventDefault();
    line = jQuery(evt.target).closest('tr');
    number = line.data('number');
    invoice.currentLine = invoice.getLine(number);
    jQuery('#line-form').remove();
    form = tmpl('invoiceLineFormTemplate', invoice.currentLine);
    return line.replaceWith(form);
  };

  InvoiceFactory.prototype.confirmLine = function(evt) {
    evt.preventDefault();
    this.formChange();
    if (invoice.currentLine.description.length > 0) {
      invoice.addLine(invoice.currentLine);
      return invoice.renderForm();
    } else {
      jQuery('#description').closest('td').addClass('has-error');
      return jQuery('#description').attr('placeholder', 'Please enter a description');
    }
  };

  InvoiceFactory.prototype.formChange = function(evt) {
    invoice.currentLine.description = jQuery('#description').val();
    invoice.currentLine.quantity = parseFloat(jQuery('#quantity').val());
    invoice.currentLine.linePrice = parseFloat(jQuery('#linePrice').val());
    return jQuery('#amount').val(money_format(invoice.currentLine.amount));
  };

  return InvoiceFactory;

})(Base);

window.invoiceFactory = new InvoiceFactory();

InvoiceLine = (function(_super) {
  __extends(InvoiceLine, _super);

  function InvoiceLine(invoice, description, quantity, linePrice, currency) {
    this.accessor('invoice', 'description', 'quantity', 'linePrice');
    this.readable('amount', 'number', 'currency');
    this._invoice = invoice;
    this._quantity = quantity != null ? quantity : 1;
    this._linePrice = linePrice != null ? linePrice : 0;
    this._description = description != null ? description : '';
    this._currency = currency != null ? currency : invoice.currency;
    this._number = invoice.lines.length + 1;
  }

  InvoiceLine.prototype.getAmount = function() {
    return this._quantity * this._linePrice;
  };

  return InvoiceLine;

})(Base);
