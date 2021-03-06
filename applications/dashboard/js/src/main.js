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
