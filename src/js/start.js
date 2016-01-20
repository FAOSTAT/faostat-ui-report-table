/*global define, console*/
define([
        'jquery',
        'loglevel',
        'config/Config',
        'config/Events',
        'globals/Common',
        'underscore',
        'handlebars',
        'text!fs-r-t/html/templates/base_template.hbs',
        'faostatapiclient',
        'amplify'
    ],
    function ($, log, C, E, Common, _, Handlebars, template, FAOSTATAPIClient) {

        'use strict';

        var defaultOptions = {
        };

        function ReportTable() {

            return this;
        }

        ReportTable.prototype.init = function (config) {

            this.o = $.extend(true, {}, defaultOptions, config);

            this.$CONTAINER = $(this.o.container);

            this.api = new FAOSTATAPIClient();

            this.render();

        };


        ReportTable.prototype.render = function() {

            var self = this;

            amplify.publish(E.LOADING_SHOW, {container: this.$CONTAINER});

            // TODO refactor code
            this.api.reportheaders({
                datasource: C.DATASOURCE,
                domain_code: 'fbs',
                report_code: 'fbs',
                lang: Common.getLocale(),
                List1Codes: [9],
                List2Codes: [2011],
                List3Codes: null,
                List4Codes: null,
                List5Codes: null,
                List6Codes: null,
                List7Codes: null,
                List1AltCodes: null,
                List2AltCodes: null,
                List3AltCodes: null,
                List4AltCodes: null,
                List5AltCodes: null,
                List6AltCodes: null,
                List7AltCodes: null
            }).then(function(h) {

                self.api.reportdata({
                    datasource: C.DATASOURCE,
                    domain_code: 'fbs',
                    report_code: 'fbs',
                    lang: Common.getLocale(),
                    List1Codes: [9],
                    List2Codes: [2011],
                    List3Codes: null,
                    List4Codes: null,
                    List5Codes: null,
                    List6Codes: null,
                    List7Codes: null,
                    List1AltCodes: null,
                    List2AltCodes: null,
                    List3AltCodes: null,
                    List4AltCodes: null,
                    List5AltCodes: null,
                    List6AltCodes: null,
                    List7AltCodes: null
                }).then(function(d) {

                    amplify.publish(E.LOADING_HIDE, {container: self.$CONTAINER});

                    self._processData(h, d);

                });
            });

        };

        ReportTable.prototype._processData = function (h, d) {

            var headerRows = this._processHeaderRows(h.data),
                columnsNumber = this._getColumnsNumber(headerRows[1]),
                dataRows = this._processDataRows(d.data, columnsNumber),
                t = Handlebars.compile(template);

            this.$CONTAINER.html(t({
                header: headerRows,
                rows: dataRows
            }));

        };

        ReportTable.prototype._processHeaderRows = function (d) {

            var r = {};

            _.each(d, function(v) {
                if ( !r.hasOwnProperty(v.RowNo)) {
                    r[v.RowNo] = [];
                }
                r[v.RowNo].push(v);
            });

            return r;

        };

       ReportTable.prototype._getColumnsNumber = function (r) {

            var t = 0;

            _.each(r, function(d) {
                t = t + d.ColSpan;

            });

            return t;

        };

       ReportTable.prototype._processDataRows = function (d, columnsNumber) {

            var rows = [],
                i;

            _.each(d, function(v) {

                var data = [];

                // reconstruct row
                for(i = 1; i < (columnsNumber + 1); i += 1) {

                    if (v.hasOwnProperty('Col' + i)) {
                        data.push(v['Col' + i]);
                    }else {
                        data.push('');
                    }

                }

                // add row
                rows.push({
                    data: data,
                    rowShade: v.RowShade
                });

            });

            return rows;

        };

        ReportTable.prototype.onError = function () {

        };

        ReportTable.prototype.destroy = function () {


        };

        return ReportTable;
    });