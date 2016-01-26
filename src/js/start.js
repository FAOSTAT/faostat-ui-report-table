/* global define, console, amplify */
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

        var REQUEST = {

            // TODO: move in a configuration file
            datasource: C.DATASOURCE,
            lang: Common.getLocale(),
            //List1Codes: [9],
            //List2Codes: [2011],

        },
        defaultOptions = {

        };

        function ReportTable() {

            return this;
        }

        ReportTable.prototype.init = function (config) {

            this.o = $.extend(true, {}, defaultOptions, config);

            this.$CONTAINER = $(this.o.container);

            this.api = new FAOSTATAPIClient();

        };

        ReportTable.prototype.export = function(config) {

            this.o = $.extend(true, {}, this.o, config);

            var self = this,
                type = this.o.type || 'excel',
                request = $.extend(true, {},
                    REQUEST,
                    this.o.request,
                    { report_code: this.o.request.domain_code }
                );

            amplify.publish(E.WAITING_SHOW);

            // TODO refactor code
            // TODO check if the table is already rendered and export without make a new request
            this.api.reportheaders(request).then(function(h) {

                self.api.reportdata(request).then(function(d) {

                    amplify.publish(E.WAITING_HIDE);

                    self._processData(h, d, false);

                    amplify.publish(E.EXPORT_TABLE_HTML, {
                        container: self.$CONTAINER,
                        type: type
                    });

                });
            });

        };

        ReportTable.prototype.render = function() {

            var self = this,
                request = $.extend(true, {}, REQUEST, this.o.request, { report_code: this.o.request.domain_code});

            log.info(request)

            amplify.publish(E.WAITING_SHOW);

            // TODO refactor code
            this.api.reportheaders(request).then(function(h) {

                self.api.reportdata(request).then(function(d) {

                    amplify.publish(E.WAITING_HIDE);

                    self._processData(h, d, true);

                });
            });

        };

        ReportTable.prototype._processData = function (h, d, render) {

            var headerRows = this._processHeaderRows(h.data),
                columnsNumber = this._getColumnsNumber(headerRows[1]),
                dataRows = this._processDataRows(d.data, columnsNumber),
                t = Handlebars.compile(template),
                display = (render === false)? 'none': null;

            this.$CONTAINER.html(t({
                header: headerRows,
                rows: dataRows,
                display: display
            }));

        };

        ReportTable.prototype._processHeaderRows = function (d) {

            var r = {};

            _.each(d, function(v) {
                if ( !r.hasOwnProperty(v.RowNo)) {
                    r[v.RowNo] = [];
                }

                v["text-align"] = (v.RowNo === 1)? null: 'center';

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
                        data.push({
                            'text-align': (i === 1)? null: 'right',
                            label: v['Col' + i]
                        });
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