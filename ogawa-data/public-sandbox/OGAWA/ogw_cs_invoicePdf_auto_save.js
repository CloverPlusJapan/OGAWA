/**
 * 機能: 請求書（invoice）の自動保存
 *  Author: 宋金来
 *  Date : 2023/10/11
 *
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(['N/currentRecord', 'N/search', 'N/format', 'N/ui/dialog', 'N/url', 'N/runtime'],

    function (currentRecord, search, format, dialog, url,runtime) {

        const CUSTOM_FORM = "240";

        function pageInit(scriptContext) {
        }


        function fieldChanged(scriptContext) {
        }

        /**
         * pdfのダウンロード
         */
        function downloadPdf() {
            debugger
            var rec = currentRecord.get();
            let customer = rec.getValue('custpage_customer_name');
            var dataFrom = isEmpty(paramsDate(rec.getValue('custpage_start_date')))? "": formatDate(rec.getValue('custpage_start_date'));
            var dataTo = isEmpty(paramsDate(rec.getValue('custpage_ent_date'))) ? "" :formatDate(rec.getValue('custpage_ent_date'));
            let options = {customer: customer, startDate: dataFrom, endDate: dataTo, flag: true}
            let searchResultCount = invoiceOrderSearch(options);
            if (searchResultCount == 0) {
                alert(" 該当データありません。")
                return;
            }
            let returnUrl = url.resolveScript({
                scriptId: "customscript_ogw_sl_invoicepdf_auto_save",
                deploymentId: "customdeploy_ogw_sl_invoicepdf_auto_save",
                params: options
            })
            window.onbeforeunload = null;
            window.location.href = returnUrl;
        }

        function downloadFile(){
            debugger
            var rec = currentRecord.get();
            let  flag = false;
            let  count = rec.getLineCount({sublistId:"custpage_sublist"});
            if (count  ==  0 ) alert(" 該当データありません。")
            for (let i = 0; i < count; i++) {
                let  check = rec.getSublistValue({sublistId:"custpage_sublist",fieldId:"custpage_sublist_checkbox",line:i});
                if (check == true){
                    let  url = rec.getSublistValue({sublistId:"custpage_sublist",fieldId:"custpage_sublist_file_url",line:i}).split("_xt=.pdf")[0];
                    url = url +"_xd=T&_xt=.pdf";
                    window.open(url);
                    flag = true;
                }
            }
            if (!flag) alert(" 少なくとも1行を選択してください。");
        }

        /**
         * システム日付フォーマットの変換
         * @param isDate
         * @returns {*}
         */
        function formatDate(isDate) {
            var userObj = runtime.getCurrentUser();
            var userFormat = userObj.getPreference({
                name: "DATEFORMAT"
            });
            userFormat = userFormat.replace(/YYYY/, isDate.getFullYear());
            if (userFormat.indexOf("MM") < 0 && userFormat.indexOf("M") >= 0) {
                userFormat = userFormat.replace(/M/, isDate.getMonth() + 1);
            } else {
                userFormat = userFormat.replace(/MM/, isDate.getMonth() + 1);
            }
            if (userFormat.indexOf("DD") < 0 && userFormat.indexOf("D") >= 0) {
                userFormat = userFormat.replace(/D/, isDate.getDate());
            } else {
                userFormat = userFormat.replace(/DD/, isDate.getDate());
            }
            return userFormat;
        }

        /**
         * ページ条件をクリア
         */
        function clearPage() {
            let currentRec = currentRecord.get();
            currentRec.setValue({fieldId: "custpage_customer_name", value: ""});
            currentRec.setValue({fieldId: "custpage_start_date", value: null});
            currentRec.setValue({fieldId: "custpage_ent_date", value: null});
        }

        /**
         *  請求書レコード検索
         * @param options
         * @returns {number}
         */
        function invoiceOrderSearch(options) {
            let filtersArr = [["type", "anyof", "CustInvc"], "AND", ["customform", "anyof", CUSTOM_FORM], "AND", ["mainline", "is", "T"]]
            if (options.customer) filtersArr.push('AND', ["customer.internalid", "anyof", options.customer]);
            for (let i = 0; i < 1; i++) {
                if (options.startDate && options.endDate) {
                    filtersArr.push('AND', ["custbody21", "within", options.startDate, options.endDate]);
                    break;
                } else if (options.startDate) {
                    filtersArr.push('AND', ["custbody21", "onorafter", options.startDate]);
                } else if (options.endDate) {
                    filtersArr.push('AND', ["custbody21", "onorbefore", options.endDate]);
                }
            }
            var invoiceSearchObj = search.create({
                type: "invoice",
                filters: filtersArr,
                columns: [search.createColumn({name: "internalid"}),]
            });
            var searchResultCount = invoiceSearchObj.runPaged().count;
            return searchResultCount;
        }

        /**
         *  解析日オブジェクト
         * @param boolean
         * @param date
         * @returns {string|*}
         */
        function paramsDate(date) {
            if (typeof (date) == 'string') return date;
            YYYY = date.getFullYear() + "";
            MM = (date.getMonth() + 1)
            MM = MM < 10 ? "0" + MM : MM;
            DS = date.getDate()
            DS = DS < 10 ? "0" + DS : DS;
            return YYYY + "/" + MM + "/" + DS
        }

        /**
         * 非空判定
         * @param obj
         * @returns {boolean}
         */
        function isEmpty(obj) {
            if (obj === undefined || obj == null || obj === '') {
                return true;
            }
            if (obj.length && obj.length > 0) {
                return false;
            }
            if (obj.length === 0) {
                return true;
            }
            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    return false;
                }
            }
            if (typeof (obj) == 'boolean') {
                return false;
            }
            if (typeof (obj) == 'number') {
                return false;
            }
            return true;
        }

        /**
         *すべてをマーク
         */
        function MarkAll() {
            debugger
            var curRec = currentRecord.get();
            var lineCount = curRec.getLineCount({sublistId: "custpage_sublist"});
            for (var i = 0; i < lineCount; i++) {
                curRec.selectLine({sublistId: "custpage_sublist", line: i});
                let  box = curRec.getSublistValue({sublistId: "custpage_sublist", fieldId: "custpage_sublist_checkbox",line:i});
                if (!box){
                    curRec.setCurrentSublistValue({sublistId: "custpage_sublist", fieldId: "custpage_sublist_checkbox", value: true});
                }
            }
        }

        /**
         * すべてのマークを外す
         */
        function unmarkAll() {
            debugger;
            let curRec = currentRecord.get();
            let sublistLineCount = curRec.getLineCount({sublistId: "custpage_sublist"});
            for (let i = 0; i < sublistLineCount; i++) {
                curRec.selectLine({sublistId: "custpage_sublist", line: i});
                let  box = curRec.getSublistValue({sublistId: "custpage_sublist", fieldId: "custpage_sublist_checkbox",line:i});
                if (box){
                    curRec.setCurrentSublistValue({sublistId: "custpage_sublist",fieldId: "custpage_sublist_checkbox", value: false});
                }
            }
        }



        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            downloadPdf, downloadPdf,
            clearPage, clearPage,
            downloadFile:downloadFile,
            MarkAll:MarkAll,
            unmarkAll:unmarkAll
        };

    });
