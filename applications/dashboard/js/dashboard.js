;(function ($, window, document, undefined) {
  'use strict';

  /**
   * Lithe Core JS library
   *
   * The {Lithe} object contains properties and functions required by the rest
   * of the Lithe components.
   *
   * @author Kasper Isager <kasper@vanillaforums.com>
   */
  window.Lithe = window.Lithe || {
    /**
     * Classes for use with toggleable components.
     *
     * Can be overridden anywhere at any time:
     *     Lithe.openClass = 'foo';
     */
    openClass   : 'is-open',
    closedClass : 'is-closed',
    activeClass : 'active',
    lastOpen    : $('is-open'),

    /**
     * Clear Lithe components
     *
     * @this {Lithe}
     */
    clear: function () {
      // If a component was opened earlier, close it
      if (Lithe.lastOpen !== undefined) {
        Lithe.close(Lithe.lastOpen, Lithe.lastToggle);
      }
    },

    /**
     * Show ("Open") a Lithe component
     *
     * @this  {Lithe}
     * @param $el
     * @param $toggle
     */
    open: function ($el, $toggle, callback) {
      var self = this;

      // If a component was opened earlier, close it
      self.clear();

      self.lastOpen = $el;
      self.lastToggle = $toggle || undefined;

      $el.addClass(self.openClass).removeClass(self.closedClass);

      if ($toggle !== undefined) Lithe.activate($toggle);

      if (callback) {
        callback();
      }
      // Was a callback specified at an earlier instance? If so, execute it
      else if (self.lastOpen.data('openCallback')) {
        self.lastOpen.data('openCallback')();
      }

      // Clear any callback that might be stored
      self.lastOpen.data('openCallback', undefined);
    },

    /**
     * Hide ("Close") a Lithe component
     *
     * @param $el
     * @param $toggle
     */
    close: function ($el, $toggle, callback) {
      var self = this;

      $el.addClass(self.closedClass).removeClass(self.openClass);

      if ($toggle !== undefined) Lithe.deactivate($toggle);

      if (callback) {
        callback();
      }
      // Was a callback specified at an earlier instance? If so, execute it
      else if (self.lastOpen.data('closeCallback')) {
        self.lastOpen.data('closeCallback')();
      }

      // Clear any callback that might be stored
      self.lastOpen.data('closeCallback', undefined);
    },

    /**
     * Activate a Lithe component
     *
     * @param $el
     */
    activate: function ($el) {
      $el.addClass(this.activeClass);
    },

    /**
     * Deactivate a Lithe component
     *
     * @param $el
     */
    deactivate: function ($el) {
      $el.removeClass(this.activeClass);
    },

    /**
     * Toggle a Lithe component
     *
     * @param {Object}   $el
     * @param {Object}   $toggle
     * @param {Function} open
     * @param {Function} close
     */
    toggle: function ($el, $toggle, open, close) {
      var self = this;

      // If no element exists, don't go any further
      if (!$el.length) return;

      if ($el.hasClass(self.openClass)) {
        self.close($el, $toggle, close);
      } else {
        self.open($el, $toggle, open);
      }

      // Store callbacks so we can use them later.
      self.lastOpen.data('closeCallback', close);
      self.lastOpen.data('openCallback', open);
    }
  };

  // Clear components on document click
  $(document).on('click', Lithe.clear);

}(jQuery, window, document));

/**
 * Drawer component for the Lithe mobile theme
 *
 * @author  Kasper Isager <kasper@vanillaforums.com>
 */
;(function ($, window, document, undefined) {
    'use strict';

    /**
     * @param   element The context in which the component was called
     * @param   options Options passed along when initializing the plugin
     * @constructor
     */
    Lithe.Drawer = function (element, options) {
        var self = this;

        self.element = element;

        self.options = {
            toggle      : undefined, // Button, link or other element to toggle the drawer
            container   : undefined, // The container to attach the classes to
            content     : undefined, // The content, collapses the drawer when clicked
            classes     : {
                show: 'drawer-show',
                hide: 'drawer-hide'
            }
        };

        if (options) {
            jQuery.extend(self.options, options);
        }

        self._enable();
    };

    Lithe.Drawer.prototype = {
        /**
         * Tear down the component
         *
         * @private
         */
        _destroy: function () {
            var self = this;

            self._disable();

            jQuery(self.element).removeData('litheDrawer');
        },

        /**
         * Get/change options AFTER initialization.
         *
         * @this    {Drawer}
         * @param   key     The option we wish to change
         * @param   value   The value we wish to assign to it
         * @returns {*}
         */
        option: function (key, value) {
            var self, options;

            self    = this;
            options = self.options;

            self._disable();

            if (key && value === 'undefined') {
                return options[key];
            }

            if (jQuery.isPlainObject(key)) {
                options = jQuery.extend(true, options, key);
            } else {
                options[key] = value;
            }

            self._enable(); // Re-enable with newly set options

            return self;
        },

        /**
         * Bind events to DOM
         *
         * @this {Drawer}
         * @private
         */
        _enable: function () {
            var self, options;

            self = this;
            options = self.options;

            jQuery(document)
                .on('click', options.toggle, function (e) {
                    e.preventDefault();
                    self.toggle();
                })
                .on('click', '.' + options.classes.show + ' ' + options.content, function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.hide();
                });
        },

        /**
         * Unbind events from DOM
         *
         * @this {Drawer}
         * @private
         */
        _disable: function () {
            var self, options;

            self = this;
            options = self.options;

            jQuery(document)
                .off('click', options.toggle)
                .off('click', options.content);
        },

        /**
         * Expand the drawer
         *
         * @this {Drawer}
         */
        show: function () {
            var self, options;

            self = this;
            options = self.options;

            jQuery(options.container).addClass(options.classes.show);
            jQuery(options.container).removeClass(options.classes.hide);
            jQuery(self.element).trigger('drawer.show');
        },

        /**
         * Collapse the drawer
         *
         * @this {Drawer}
         */
        hide: function () {
            var self, options;

            self = this;
            options = self.options;

            jQuery(options.container).addClass(options.classes.hide);
            jQuery(options.container).removeClass(options.classes.show);
            jQuery(self.element).trigger('drawer.hide');
        },

        /**
         * Toggle between the expanded and collapsed state of the drawer
         *
         * @this {Drawer}
         */
        toggle: function () {
            var self, options;

            self = this;
            options = self.options;

            if (jQuery(options.container).hasClass(options.classes.show)) {
                self.hide();
            } else {
                self.show();
            }
        }
    };

    $.fn.drawer = function (options) {
        return this.each(function () {
            if ($.data(this, 'drawer') === undefined) {
                $.data(this, 'drawer', new Lithe.Drawer(this, options));
            }
        });
    }

})(jQuery, window, document);


var DashboardModal = (function() {

    var DashboardModal = function($trigger, settings) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.setupTrigger($trigger);
        this.addToDom();

        this.settings = {};
        this.defaultContent.closeIcon = dashboardSymbol('close');
        $.extend(true, this.settings, this.defaultSettings, settings, $trigger.data());

        this.trigger = $trigger;
        this.target = $trigger.attr('href');
        this.addEventListeners();
        this.start();
    };

    DashboardModal.prototype = {

        activeModal: undefined,

        defaultSettings: {
            httpmethod: 'get',
            afterSuccess: function(json, sender) {},
            reloadPageOnSave: true
        },

        id: '',

        defaultContent: {
            cssClass: '',
            title: '',
            footer: '',
            closeIcon: '',
            body: '',
            form: {
                open: '',
                close: ''
            }
        },

        settings: {},

        target: '',

        trigger: {},


        modalHtml: ' \
        <div><div class="modal-dialog {cssClass}" role="document"> \
            <div class="modal-content"> \
                <div class="modal-header"> \
                    <button type="button" class="btn-icon modal-close close" data-dismiss="modal" aria-label="Close"> \
                        {closeIcon} \
                    </button> \
                    <h4 class="modal-title">{title}</h4> \
                </div> \
                {form.open} \
                <div class="modal-body">{body}</div> \
                <div class="modal-footer">{footer}</div> \
                {form.close} \
            </div> \
        </div></div>',

        modalHtmlNoHeader: ' \
        <div><div class="modal-dialog modal-no-header {cssClass}" role="document"> \
            <div class="modal-content"> \
                <div class="modal-body">{body}</div> \
                <button type="button" class="btn-icon modal-close close" data-dismiss="modal" aria-label="Close"> \
                    {closeIcon} \
                </button> \
            </div> \
        </div></div>',

        modalShell: '<div class="modal fade" id="{id}" tabindex="-1" role="dialog" aria-hidden="true"></div>',

        start: function($trigger, settings) {
            $('#' + this.id).modal('show').focus();
            if (this.settings.modaltype === 'confirm') {
                this.addConfirmContent();
            } else {
                this.addContent();
            }
        },

        load: function() {
            this.handleForm();
        },

        addToDom: function() {
            $('body').append(this.modalShell.replace('{id}', this.id));
        },

        setupTrigger: function($trigger) {
            $trigger.attr('data-target', '#' + this.id);
            $trigger.attr('data-modal-id', this.id);
        },

        addEventListeners: function() {
            var self = this;
            $('#' + self.id).on('shown.bs.modal', function() {
                self.handleForm($('#' + self.id));
            });
            $('#' + self.id).on('hidden.bs.modal', function() {
                $(this).remove();
            });
            $('#' + self.id).on('click', '.js-ok', function() {
                self.handleConfirm(this);
            });
            $('#' + self.id).on('click', '.js-cancel', function() {
                $('#' + self.id).modal('hide');
            });
        },

        handleConfirm: function() {
            var self = this;

            // request the target via ajax
            var ajaxData = {'DeliveryType' : 'VIEW', 'DeliveryMethod' : 'JSON'};
            if (self.settings.httpmethod === 'post') {
                ajaxData.TransientKey = gdn.definition('TransientKey');
            }

            $.ajax({
                method: (self.settings.httpmethod === 'post') ? 'POST' : 'GET',
                url: self.target,
                data: ajaxData,
                dataType: 'json',
                error: function(xhr) {
                    gdn.informError(xhr);
                    $('#' + self.id).modal('hide');
                },
                success: function(json) {
                    gdn.inform(json);
                    gdn.processTargets(json.Targets);
                    if (json.RedirectUrl) {
                        setTimeout(function() {
                            document.location.replace(json.RedirectUrl);
                        }, 300);
                    } else {
                        $('#' + self.id).modal('hide');
                        self.afterConfirmSuccess();
                    }
                }
            });
        },

        // Default is to remove the closest item with the class 'js-modal-item'
        afterConfirmSuccess: function() {
            var found = false;
            if (!this.settings.confirmaction || this.settings.confirmaction === 'delete') {
                found = this.trigger.closest('.js-modal-item').length !== 0;
                this.trigger.closest('.js-modal-item').remove();
            }

            // Refresh the page.
            if (!found) {
                document.location.replace(window.location.href);
            }
        },

        confirmContent: function() {
            // Replace language definitions
            var confirmHeading = gdn.definition('ConfirmHeading', 'Confirm');
            var confirmText = gdn.definition('ConfirmText', 'Are you sure you want to do that?');
            var ok = gdn.definition('Okay', 'Okay');
            var cancel = gdn.definition('Cancel', 'Cancel');

            var footer = '<button class="btn btn-primary btn-ok js-ok">' + ok + '</button>';
            footer += '<button class="btn btn-primary btn-cancel js-cancel">' + cancel + '</button>';

            return {
                title: confirmHeading,
                footer: footer,
                body: confirmText,
                cssClass: 'modal-sm modal-confirm'
            };
        },

        addConfirmContent: function() {
            var self = this;
            $('#' + self.id).htmlTrigger(self.replaceHtml(self.confirmContent()));
        },

        replaceHtml: function(parsedContent) {

            // Copy the defaults into the content array
            var content = {};
            $.extend(true, content, this.defaultContent);

            // Data attributes override parsed content, content overrides defaults.
            $.extend(true, parsedContent, this.settings.content);
            $.extend(true, content, parsedContent);

            var html = '';

            if (this.settings.modalType === 'noheader') {
                html = this.modalHtmlNoHeader;
            } else {
                html = this.modalHtml;
            }

            html = html.replace('{body}', content.body);
            html = html.replace('{cssClass}', content.cssClass);
            html = html.replace('{title}', content.title);
            html = html.replace('{closeIcon}', content.closeIcon);
            html = html.replace('{footer}', content.footer);
            html = html.replace('{form.open}', content.form.open);
            html = html.replace('{form.close}', content.form.close);

            return html;
        },

        addContent: function() {
            var self = this;
            var ajaxData = {
                'DeliveryType' : 'VIEW',
                'DeliveryMethod' : 'JSON'
            };

            $.ajax({
                method: 'GET',
                url: self.target,
                data: ajaxData,
                dataType: 'json',
                error: function(xhr) {
                    gdn.informError(xhr);
                    $('#' + self.id).modal('hide');
                },
                success: function(json) {
                    var body = json.Data;
                    var content = self.parseBody(body);
                    $('#' + self.id).htmlTrigger(self.replaceHtml(content));
                }
            });
        },

        // Add any error messages to popup form or close modal on form save.
        handleForm: function(element) {
            var self = this;

            $('form', element).ajaxForm({
                data: {
                    'DeliveryType': 'VIEW',
                    'DeliveryMethod': 'JSON'
                },
                dataType: 'json',
                success: function(json, sender) {
                    gdn.inform(json);
                    gdn.processTargets(json.Targets);

                    if (json.FormSaved === true) {
                        self.afterFormSuccess(json, sender, json.RedirectUrl);
                        $('#' + self.id).modal('hide');
                    } else {
                        var body = json.Data;
                        var content = self.parseBody(body);
                        $('#' + self.id + ' .modal-body').htmlTrigger(content.body);
                        $('#' + self.id + ' .modal-body').scrollTop(0);
                    }
                },
                error: function(xhr) {
                    gdn.informError(xhr);
                    $('#' + self.id).modal('hide');
                }
            });
        },

        // Respect redirectUrl after form saves and redirect.
        afterFormSuccess: function(json, sender, redirectUrl) {
            this.settings.afterSuccess(json, sender);
            if (redirectUrl) {
                setTimeout(function() {
                    document.location.replace(redirectUrl);
                }, 300);
            } else if (this.settings.reloadPageOnSave) {
                document.location.replace(window.location.href);
            }
        },

        parseBody: function(body) {
            var title = '';
            var footer = '';
            var formTag = '';
            var formCloseTag = '';
            var $elem = $('<div />').append($($.parseHTML(body + ''))); // Typecast html to a string and create a DOM node
            var $title = $elem.find('h1');
            var $footer = $elem.find('.Buttons, .js-modal-footer');
            var $form = $elem.find('form');

            // Pull out the H1 block from the view to add to the modal title
            if ($title.length !== 0) {
                title = $title.html();
                $title.remove();
                body = $elem.html();
            }

            // Pull out the buttons from the view to add to the modal footer
            if ($footer.length !== 0) {
                footer = $footer.html();
                $footer.remove();
                body = $elem.html();
            }

            // Pull out the form opening and closing tags to wrap around the modal-content and modal-footer
            if ($form.length !== 0) {
                formCloseTag = '</form>';
                var formHtml = $form.prop('outerHTML');
                formTag = formHtml.split('>')[0] += '>';
                body = body.replace(formTag, '');
                body = body.replace('</form>', '');
            }

            return {
                title: title,
                footer: footer,
                body: body,
                form: {
                    open: formTag,
                    close: formCloseTag
                }
            };
        }
    };

    return DashboardModal;

})();

/*!
 * Dashboard v3 - A new dashboard design for Vanilla.
 *
 * @author    Becky Van Bussel <beckyvanbussel@gmail.com>
 * @copyright 2016 (c) Becky Van Bussel
 * @license   MIT
 */

'use strict';

(function($) {

    var codeInput = {
        // Replaces any textarea with the 'js-code-input' class with an code editor.
        start: function(element) {
            $('.js-code-input', element).each(function () {
                codeInput.makeAceTextArea($(this));
            });
        },

        // Adds the 'js-code-input' class to a form and the mode and height data attributes.
        init: function(textarea, mode, height) {
            if (!textarea.length) {
                return;
            }
            textarea.addClass('js-code-input');
            textarea.data('code-input', {'mode': mode, 'height': height});
        },

        //
        makeAceTextArea: function (textarea) {
            var mode = textarea.data('code-input').mode;
            var height = textarea.data('code-input').height;
            var modes = ['html', 'css'];

            if (modes.indexOf(mode) === -1) {
                mode = 'html';
            }
            if (!height) {
                height = 400;
            }

            // Add the ace input before the actual textarea and hide the textarea.
            var formID = textarea.attr('id');
            textarea.before('<div id="editor-' + formID + '" style="height: ' + height + 'px;"></div>');
            textarea.hide();

            var editor = ace.edit('editor-' + formID);
            editor.$blockScrolling = Infinity;
            editor.getSession().setMode('ace/mode/' + mode);
            editor.setTheme('ace/theme/clouds');

            // Set the textarea value on the ace input and update the textarea when the ace input is updated.
            editor.getSession().setValue(textarea.val());
            editor.getSession().on('change', function () {
                textarea.val(editor.getSession().getValue());
            });
        }
    };

    function prettyPrintInit(element) {
        // Pretty print
        $('#Pockets td:nth-child(4)', element).each(function () {
            var html = $(this).html();
            $(this).html('<pre class="prettyprint lang-html" style="white-space: pre-wrap;">' + html + '</pre>');
        });
        $('pre', element).addClass('prettyprint lang-html');
        prettyPrint();
    }

    function aceInit(element) {
        // Editor classes
        codeInput.init($('.pockets #Form_Body', element), 'html', 200);
        codeInput.init($('#Form_CustomHtml', element), 'html', 800);
        codeInput.init($('#Form_CustomCSS', element), 'css', 800);
        codeInput.start(element);
    }

    function scrollToFixedInit(element) {

        var $navbar = $('.navbar');
        var $spacer = $('.js-scroll-to-fixed-spacer');

        $navbar.addClass('navbar-short');
        var navShortHeight = $('.navbar').outerHeight(true);
        $navbar.removeClass('navbar-short');
        var navHeight = $navbar.outerHeight(true);
        $spacer.height(navHeight);

        var navOffset = navHeight - navShortHeight;

        $('.navbar', element).scrollToFixed({
            zIndex: 1005,
            spacerClass: 'js-scroll-to-fixed-spacer'
        });

        $('.modal-header', element).scrollToFixed({
            zIndex: 1005
        });

        $('.modal-footer', element).scrollToFixed({
            zIndex: 1005
        });

        // If we load in the middle of the page, we should have a short navbar.
        if ($(window).scrollTop() > navOffset) {
            $('.navbar').addClass('navbar-short');
        }

        $(window).on('scroll', function() {
            if ($(window).scrollTop() > navOffset) {
                $navbar.addClass('navbar-short');
            } else {
                $navbar.removeClass('navbar-short');
                $spacer.height(navHeight);
            }
        });
    }

    function fluidFixedInit(element) {
        $('.js-fluid-fixed', element).fluidfixed({
            offsetBottom: 72
        });
    }

    function userDropDownInit(element) {
        var html = $('.js-dashboard-user-dropdown').html();
        if ($('.navbar .js-card-user', element).length !== 0) {
            new Drop({
                target: document.querySelector('.navbar .js-card-user', element),
                content: html,
                constrainToWindow: true,
                remove: true,
                tetherOptions: {
                    attachment: 'top right',
                    targetAttachment: 'bottom right',
                    offset: '-10 0'
                }
            });
        }
    }

    /**
     * Un-collapses a group if one of its links is active.
     *
     * @param element
     */
    function collapseInit(element) {
        var $active = $('.js-nav-collapsible a.active', element);
        var $collapsible = $active.parents('.collapse');
        $collapsible.addClass('in');
        $('a[href=#' + $collapsible.attr('id') + ']').attr('aria-expanded', 'true');
        $('a[href=#' + $collapsible.attr('id') + ']').removeClass('collapsed');
    }

    function clipboardInit() {
        var clipboard = new Clipboard('.btn-copy');

        clipboard.on('success', function(e) {
            var tooltip = $(e.trigger).tooltip({
                show: true,
                placement: 'bottom',
                title: $(e.trigger).attr('data-success-text'),
                trigger: 'manual',
            });
            tooltip.tooltip('show');
            setTimeout(function() {
                tooltip.tooltip('hide');
            }, '2000');
        });

        clipboard.on('error', function(e) {
            console.log(e);
        });
    }

    function drawerInit(element) {

        $('.panel-left', element).drawer({
            toggle    : '.js-panel-left-toggle'
            , container : '.main-container'
            , content   : '.main-row .main'
        });

        $('.panel-left', element).on('drawer.show', function() {
            window.scrollTo(0, 0);
            $('.panel-nav .js-fluid-fixed').trigger('detach.FluidFixed');
            $('.main').height($('.panel-nav .js-fluid-fixed').outerHeight(true) + 132);
            $('.main').css('overflow', 'hidden');

        });

        $('.panel-left', element).on('drawer.hide', function() {
            $('.panel-nav .js-fluid-fixed').trigger('reset.FluidFixed');
            $('.main').height('auto');
            $('.main').css('overflow', 'auto');
        });

        $(window).resize(function() {
            if ($('.js-panel-left-toggle').css('display') !== 'none') {
                $('.main-container', element).addClass('drawer-hide');
                $('.main-container', element).removeClass('drawer-show');
                $('.panel-left', element).trigger('drawer.hide');
            }
        });
    }

    function icheckInit(element) {
        var selector = 'input:not(.label-selector-input):not(.toggle-input):not(.avatar-delete-input):not(.jcrop-keymgr)';

        $(selector, element).iCheck({
            aria: true
        }).on('ifChanged', function() {
            $(this).trigger('change');
        });

        $(selector, element).on('inputChecked', function() {
            $(this).iCheck('check');
        });
        $(selector, element).on('inputDisabled', function() {
            $(this).iCheck('disable');
        });
    }

    function expanderInit(element) {
        $('.FeedDescription', element).expander({
            slicePoint: 65,
            normalizeWhitespace: true,
            expandText: gdn.definition('ExpandText'),
            userCollapseText: gdn.definition('CollapseText')
        });
    }

    function modalInit() {
        if (typeof(DashboardModal.activeModal) === 'object') {
            DashboardModal.activeModal.load();
        }
    }

    function responsiveTablesInit(element) {
        var containerSelector = '#main-row .main';

        // We're in a popup.
        if (typeof(DashboardModal.activeModal) === 'object') {
            containerSelector = '#' + DashboardModal.activeModal.id + ' .modal-body';
        }

        $('.table-data', element).tablejengo({container: containerSelector});
    }

    $(document).on('contentLoad', function(e) {
        prettyPrintInit(e.target); // prettifies <pre> blocks
        aceInit(e.target); // code editor
        collapseInit(e.target); // panel nav collapsing
        scrollToFixedInit(e.target); // navbar scroll settings and modal fixed header and footer
        fluidFixedInit(e.target); // panel and scroll settings
        userDropDownInit(e.target); // navbar 'me' dropdown
        modalInit(); // modals (aka popups)
        clipboardInit(); // copy elements to the clipboard
        drawerInit(e.target); // responsive hamburger menu nav
        icheckInit(e.target); // checkboxes and radios
        expanderInit(e.target); // truncates text and adds link to expand
        responsiveTablesInit(e.target); // makes tables responsive
    });

    // Event handlers

    $(document).on('shown.bs.collapse', function() {
        $('.panel-nav .js-fluid-fixed').trigger('reset.FluidFixed');
    });

    $(document).on('hidden.bs.collapse', function() {
        $('.panel-nav .js-fluid-fixed').trigger('reset.FluidFixed');
    });

    $(document).on('click', '.js-save-pref-collapse', function() {
        var key = $(this).data('key');
        var collapsed = !$(this).hasClass('collapsed');

        // request the target via ajax
        var ajaxData = {'DeliveryType' : 'VIEW', 'DeliveryMethod' : 'JSON'};

        ajaxData.TransientKey = gdn.definition('TransientKey');
        ajaxData.key = key;
        ajaxData.collapsed = collapsed;

        $.ajax({
            method: 'POST',
            url: gdn.url('dashboard/userpreferencecollapse'),
            data: ajaxData,
            dataType: 'json'
        });
    });

    $(document).on('click', '.js-save-pref-section-landing-page', function() {
        var url = $(this).data('linkPath');
        var section = $(this).data('section');

        // request the target via ajax
        var ajaxData = {'DeliveryType' : 'VIEW', 'DeliveryMethod' : 'JSON'};

        ajaxData.TransientKey = gdn.definition('TransientKey');
        ajaxData.url = url;
        ajaxData.section = section;

        $.ajax({
            method: 'POST',
            url: gdn.url('dashboard/userpreferencesectionlandingpage'),
            data: ajaxData,
            dataType: 'json'
        });
    });

    $(document).on('click', '.js-save-pref-dashboard-landing-page', function() {
        var section = $(this).data('section');

        // request the target via ajax
        var ajaxData = {'DeliveryType' : 'VIEW', 'DeliveryMethod' : 'JSON'};

        ajaxData.TransientKey = gdn.definition('TransientKey');
        ajaxData.section = section;

        $.ajax({
            method: 'POST',
            url: gdn.url('dashboard/userpreferencedashboardlandingpage'),
            data: ajaxData,
            dataType: 'json'
        });
    });

    $(document).on('change', '.js-file-upload', function() {
        var filename = $(this).val();
        if (filename.substring(3, 11) === 'fakepath') {
            filename = filename.substring(12);
        }
        if (filename) {
            $(this).parent().find('.file-upload-choose').html(filename);
        }
    });

    $(document).on('click', '.js-modal', function(e) {
        e.preventDefault();
        DashboardModal.activeModal = new DashboardModal($(this), {});
    });

    $(document).on('click', '.js-modal-confirm.js-hijack', function(e) {
        e.preventDefault();
        DashboardModal.activeModal = new DashboardModal($(this), {
            httpmethod: 'post',
            modaltype: 'confirm'
        });
    });

    $(document).on('click', '.js-modal-confirm:not(.js-hijack)', function(e) {
        e.preventDefault();
        DashboardModal.activeModal = new DashboardModal($(this), {
            httpmethod: 'get',
            modaltype: 'confirm'
        });
    });

    // Get new banner image.
    $(document).on('click', '.js-upload-email-image-button', function(e) {
        e.preventDefault();
        DashboardModal.activeModal = new DashboardModal($(this), {
            afterSuccess: emailStyles.reloadImage
        });
    });

    $(document).on('click', '.js-modal-close', function() {
        if (typeof(DashboardModal.activeModal) === 'object') {
            $('#' + DashboardModal.activeModal.id).modal('hide');
        }
    });

})(jQuery);

var dashboardSymbol =  function(name, alt, cssClass) {
    if (alt) {
        alt = 'alt="' + alt + '" ';
    } else {
        alt = '';
    }

    if (!cssClass) {
        cssClass = '';
    }

    return '<svg ' + alt + ' class="icon ' + cssClass + 'icon-svg-' + name + '" viewBox="0 0 17 17"><use xlink:href=\"#' + name + '" /></svg>';
};
