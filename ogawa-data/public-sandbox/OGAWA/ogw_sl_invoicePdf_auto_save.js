/**
 *  機能: 請求書（invoice）の自動保存
 *  Author: 宋金来
 *  Date : 2023/10/11
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/search', 'N/ui/serverWidget', 'N/record', 'N/render', 'N/file', 'N/format', 'N/task', 'N/https', 'N/runtime', 'N/redirect', 'N/url'],

    (search, ui, record,render,file,format,task,https,runtime,redirect,url) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const  INVOICE_PDF = '483';
        const  DEPLOYMENT_ID= "7391";
        const  CUSTOM_FORM = "240"; // 	OGJ Invoice
        const  SCRIPT_TYPE=  "355";
        const  FILE_ID=  "162894"; //請求書 file id

        const onRequest = (scriptContext) => {
            var options = {};
            var request = scriptContext.request
            var response = scriptContext.response
            var form;
            form = createBodyForm();
            if ( request.method=='GET'){
                options.customer = request.parameters.customer;
                options.startDate = request.parameters.startDate;
                options.endDate = request.parameters.endDate;
                options.flag = request.parameters.flag;
                // options.pageflag = request.parameters.pageflag;
                // options.taskId = request.parameters.taskId;
            } else {
               form = loadFileFrom();
            }

            if (!isEmpty(options.flag)) {
                var dataArr = invoiceOrderSearch(options)
                // var currUserName =  runtime.getCurrentUser().name;
                // var folderRec = record.create({type:record.Type.FOLDER});
                // folderRec.setValue("parent",INVOICE_PDF)
                // folderRec.setValue("name",currUserName+"_"+getFormatYmdHms());
                // var folderId = folderRec.save();
                // var res ={dataArr, folderId}
                 var res ={dataArr}
                var mapReduceScript = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
                mapReduceScript.scriptId = 'customscript_ogw_ss_invoicepdf_auto_save';
                mapReduceScript.deploymentId = 'customdeploy_ogw_ss_invoicepdf_auto_save';
                mapReduceScript.params = {"custscript_owg_data_json": JSON.stringify(res)}
                // var taskId = mapReduceScript.submit();
                // redirect.toSuitelet({scriptId:"customscript_ogw_sl_invoicepdf_auto_save",deploymentId:"customdeploy_ogw_sl_invoicepdf_auto_save",parameters:{"pageflag":1,"taskId":taskId}})
                // let  urlScript = url.resolveScript({scriptId:"customscript_ogw_ss_invoicepdf_auto_save",deploymentId:"customdeploy_ogw_ss_invoicepdf_auto"})
                // var linkParam = {sortcol: "dcreated", sortdir: "DESC", date: "TODAY", scripttype: SCRIPT_TYPE, primarykey: ''};
                // var linkUrl = url.resolveTaskLink({id: "LIST_SCRIPTSTATUS", params: linkParam});
                // form.updateDefaultValues({custpage_flag: linkUrl});
               //  redirect.redirect({url: linkUrl});
                   form = loadFileFrom();

            }

            response.writePage(form);
        }


        /**
         * 本体画面の作成
         * @returns {Form}
         */
        function createBodyForm() {
            var form = ui.createForm({title: "請求書一括ダウンロード"});
            form.clientScriptModulePath = './ogw_cs_invoicePdf_auto_save.js';
            form.addButton({id:"downloadPdf", label: "PDFダウンロード", functionName:"downloadPdf"});
            form.addButton({id: 'clear', label: "クリア", functionName: 'clearPage'});
            let a = form.addField({id: 'custpage_customer_name', label: "顧客", type: ui.FieldType.SELECT, source: "customer"});
            let b = form.addField({id: "custpage_start_date", label: "開始日", type: ui.FieldType.DATE});
            let c = form.addField({id: "custpage_ent_date", label: "終了日", type: ui.FieldType.DATE})
            // form.addField({id: "custpage_flag", label: "flag", type: ui.FieldType.TEXT})
            a.updateBreakType({breakType: ui.FieldBreakType.STARTCOL});
            return form;
        }

        function loadFileFrom (){
            var form = ui.createForm({title: "請求書一括ダウンロード"});
            form.addSubmitButton({id:"searchFile",label:"更新"});
            form.clientScriptModulePath = './ogw_cs_invoicePdf_auto_save.js';
            form.addButton({id:"downloadFile",label:"ダウンロード",functionName:"downloadFile"})
            var subList = form.addSublist({id: 'custpage_sublist', type: ui.SublistType.LIST, label: '一覧'});
            subList.addButton({id: 'custpage_sublist_btn_mark_all', label: 'すべてをマーク', functionName: 'MarkAll'});
            subList.addButton({id: 'custpage_sublist_btn_previous_unmark_all', label: 'すべてのマークを外す', functionName: 'unmarkAll'});
            subList.addField({id: 'custpage_sublist_checkbox', type: ui.FieldType.CHECKBOX, label: '選択'});
            subList.addField({id: 'custpage_sublist_date', type: ui.FieldType.TEXT, label: '日付'});
            subList.addField({id: 'custpage_sublist_file_name', type: ui.FieldType.TEXT, label: 'ファイル名'});
            let url = subList.addField({id: 'custpage_sublist_file_url', type: ui.FieldType.TEXT, label: 'url'});
            url.updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});
            var fileSearchObj = search.create({
                type: "file",
                filters: [["folder","anyof",FILE_ID]],
                columns:
                    [
                        search.createColumn({name: "name", sort: search.Sort.ASC, label: "名称"}),
                        // search.createColumn({name: "folder"}),
                        search.createColumn({name: "url", label: "文件URL"}),
                        search.createColumn({name: "created", sort: search.Sort.DESC,}),
                        // search.createColumn({name: "modified" }),
                        // search.createColumn({name: "filetype"})
                    ]
            });
            var count = fileSearchObj.runPaged().count;
            if (count == 0 ) return form;
            let index = 0;
            fileSearchObj.run().each(function(result){
                subList.setSublistValue({id: "custpage_sublist_file_name", line: index, value:result.getValue('name')});
                subList.setSublistValue({id: "custpage_sublist_date", line: index, value: result.getValue('created')});
                subList.setSublistValue({id: "custpage_sublist_file_url", line: index, value: result.getValue('url')});
                index ++;
                return true;
            });
            return form;
        }

        /**
         * 画面を読み込む
         * @returns {Form}
         */
        function loadForm() {
            var form = ui.createForm({title: "処理状態"});
            // 実行情報
            form.addFieldGroup({id:'custpage_run_info', label:'実行情報'});
            form.addSubmitButton({label: "更新"});
            // バッチ状態
            var batchStatus = getScheduledScriptRunStatus(DEPLOYMENT_ID);
            if (batchStatus == 'FAILED') {
                // 実行失敗の場合
                var runstatusField = form.addField({id:'custpage_run_info_status', type: 'text',label:' ',container: 'custpage_run_info'});
                runstatusField.updateDisplayType({displayType: ui.FieldDisplayType.INLINE});
                runstatusField.setDisplayType({type:"inline"});
                var messageColour = '<font color="red"> バッチ処理を失敗しました </font>';
                runstatusField.defaultValue=messageColour;
            } else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {
                // 実行中の場合
                var runstatusField = form.addField({id:'custpage_run_info_status', type: 'text',label:' ',container: 'custpage_run_info'});
                runstatusField.updateDisplayType({displayType: ui.FieldDisplayType.INLINE});
                runstatusField.defaultValue='バッチ処理を実行中';
            }else {
                var runstatusField = form.addField({id:'custpage_run_info_status', type: 'text',label:' ',container: 'custpage_run_info'});
                runstatusField.updateDisplayType({displayType: ui.FieldDisplayType.INLINE});
                runstatusField.defaultValue='処理完成しました。';
            }
            return form
        }

        /**
         * 請求書レコード検索
         * @param options
         * @returns {*[]}
         */
        function invoiceOrderSearch(options) {
            let dataArr = [];
            let filtersArr = [["type", "anyof", "CustInvc"], "AND", ["customform", "anyof", CUSTOM_FORM] , "AND", ["mainline", "is", "T"]]
            if (options.customer) filtersArr.push('AND', ["customer.internalid", "anyof", options.customer]);
            for (let i = 0; i < 1; i++) {
                if (options.startDate && options.endDate) {
                    filtersArr.push('AND', ["custbody21", "within", options.startDate, options.endDate]);
                    break;
                } else if (options.startDate){
                    filtersArr.push('AND', ["custbody21", "onorafter", options.startDate]);
                }else if (options.endDate){
                    filtersArr.push('AND', ["custbody21", "onorbefore", options.endDate]);
                }
            }
            var invoiceSearchObj = search.create({
                type: "invoice",
                filters: filtersArr,
                columns: [search.createColumn({name: "internalid"})]
            });
            var searchResultCount = invoiceSearchObj.runPaged().count;
            log.audit("searchResultCount", searchResultCount);
            let resultArr = getAllResults(invoiceSearchObj)
            if (!isEmpty(resultArr)) {
                for (let i = 0; i < resultArr.length; i++) {
                    dataArr.push(resultArr[i].id)
                }
            }
            return dataArr;
        }

        /**
         *スクリプトステータスの取得
         * @param deploymentId
         * @returns {string}
         */
        function getScheduledScriptRunStatus(deploymentId){
           var status = "";
            var scheduledscriptinstanceSearchObj = search.create({
                type: "scheduledscriptinstance",
                filters:
                    [
                        ["datecreated", "on", "today"],
                        "AND",
                        ["scriptdeployment.internalid", "anyof", deploymentId]
                    ],
                columns:
                    [
                        search.createColumn({name: "datecreated", summary: "MAX", sort: search.Sort.DESC}),
                        search.createColumn({name: "status", summary: "GROUP"})
                    ]
            });
            let  count = scheduledscriptinstanceSearchObj.runPaged().count;
            log.audit("count", count );
            scheduledscriptinstanceSearchObj.run().each(function(result){
                status = result.getValue({name: "status", summary: "GROUP"}).toUpperCase();
            });
            log.audit("status", status);
            return status;
        }

        /**
         * システム時間の取得メソッド
         */
        function getSystemTime() {
            // システム時間
            var now = new Date();
            var offSet = now.getTimezoneOffset();
            var offsetHours = 9 + (offSet / 60);
            now.setHours(now.getHours() + offsetHours);

            return now;
        }

        /**
         * バッチ実行日付を取得する
         *
         * @returns
         */
        function getScheduledScriptDate() {
            var now = getSystemTime();
            now.setHours(0, 0, 0, 0);
            return now;
        }

        /**
         * システム日付と時間をフォーマットで取得
         */
        function getFormatYmdHms() {

            // システム時間
            var now = getSystemTime();

            var str = now.getFullYear().toString();
            str += (now.getMonth() + 1).toString();
            str += now.getDate() + "_";
            str += now.getHours();
            str += now.getMinutes();
            str += now.getMilliseconds();

            return str;
        }

        /**
         * @param mySearch
         * @returns {[]}
         */
        const getAllResults = (mySearch) => {
            var resultSet = mySearch.run();
            var resultArr = [];
            var start = 0;
            var step = 1000;
            var results = resultSet.getRange({start: start, end: step});
            while (results && results.length > 0) {
                resultArr = resultArr.concat(results);
                start = Number(start) + Number(step);
                results = resultSet.getRange({start: start, end: Number(start) + Number(step)});
            }
            return resultArr;
        }

        /**
         * 非空判定
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


        return {onRequest}

    });
