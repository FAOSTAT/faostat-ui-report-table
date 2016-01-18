/*global define, console*/
define([
        'jquery',
        'loglevel'
    ],
    function ($, log) {

        'use strict';

        var defaultOptions = {
        };

        function ReportTable() {

            log.info('daje')

            return this;
        }

        ReportTable.prototype.init = function (config) {

            this.o = $.extend(true, {}, defaultOptions, config);

        };

        ReportTable.prototype.render = function () {

        };

        ReportTable.prototype.onError = function (e) {

        };

        ReportTable.prototype.destroy = function () {


        };

        return ReportTable;
    });