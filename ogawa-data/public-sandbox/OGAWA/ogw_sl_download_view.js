/**
 * 機能: 発注書・注文書一括ダウンロード
 * Author: CPC_劉相坤
 * Date:2023/10/13
 * 
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/ui/serverWidget', 'N/search', 'N/runtime', 'N/task', 'N/file', 'N/format', 'N/record', 'N/url', 'N/redirect', "../common/common_ogw.js"], 
       
  function( serverWidget, search, runtime, task, file, format, record, url, redirect, common ) {
    
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest (context) {

        // 画面入力値取得
        let output = context.request.parameters.output;
        let dateFrom = context.request.parameters.date_from;
        let dateTo = context.request.parameters.date_to;
        let vendor = context.request.parameters.vendor;
        let customer = context.request.parameters.customer;
        let flag = context.request.parameters.flag;
    
        // POSTの場合
        if (flag) {
            // 現在のScriptパラメータ値の取得
            let currentScript = runtime.getCurrentScript();
            let poScript = currentScript.getParameter({name:"custscript_po"});
            let soScript = currentScript.getParameter({name:"custscript_so"});
            let poFolder = currentScript.getParameter({name:"custscript_po_folder"});
            let soFolder = currentScript.getParameter({name:"custscript_so_folder"});
            let typeFlag = currentScript.getParameter({name:"custscript_type_flag"});
            let poName = currentScript.getParameter({name:"custscript_po_name"});
            let soName = currentScript.getParameter({name:"custscript_so_name"});
            
            // 親フォルダ取得
            let oyafolderId = output == typeFlag ? poFolder : soFolder;
            // フォルダ名の作成
            let folderName = output == typeFlag ? poName + common.getTokyoDate( format, true ) : soName + common.getTokyoDate( format, true );
            // フォルダ作成
            let folder = record.create({
                type : record.Type.FOLDER
            });
            // フォルダに値セット- 親フォルダID
            folder.setValue({
                fieldId : 'parent',
                value : oyafolderId
            });
            // フォルダに値セット - フォルダ名
            folder.setValue({
                fieldId : 'name',
                value : folderName
            });
            
            // フォルダをセーブ
            let folderId = folder.save();
            
            // 発注書の場合
            if ( output == 'output_po' ) {
                // 定期スクリプトの作成
                let mrScript = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT
                });
                // スクリプト
                mrScript.scriptId = 'customscript_ogw_ss_download_view';
                // デプロイメント
                mrScript.deploymentId = 'customdeploy_ogw_ss_download_view';
                // スクリプトパラメータ
                mrScript.params = {
                        'custscript_down_pdf_output' : output,
                        'custscript_down_pdf_date_from' : dateFrom,
                        'custscript_down_pdf_date_to' : dateTo,
                        'custscript_down_pdf_vendor' : vendor,
                        'custscript_down_pdf_customer' : customer,
                        'custscript_down_pdf_folderId' : folderId,
                };
                // 定期スクリプト　実行
                let taskId = mrScript.submit();
                
                // リンクパラメータ
                let linkParam = {
                        sortcol : "dcreated",
                        sortdir : "DESC",
                        date : "TODAY",
                        scripttype : poScript,
                };
                
                // URLジャンプ
                let linkUrl = url.resolveTaskLink({ id : "LIST_SCRIPTSTATUS", params : linkParam });
                redirect.redirect({ url : linkUrl });
                
            } else {
            
                // MapReduceスクリプトの作成
                let mrScript = task.create({
                    taskType: task.TaskType.MAP_REDUCE
                });
                
                // スクリプト
                mrScript.scriptId = 'customscript_ogw_mr_download_view_so';
                // デプロイメント
                mrScript.deploymentId = 'customdeploy_ogw_mr_download_view_so';
                // スクリプトパラメータ
                mrScript.params = {
                        'custscript_ogw_down_load_customer' : customer,
                        'custscript_ogw_down_load_start' : dateFrom,
                        'custscript_ogw_down_load_enddate' : dateTo,
                        'custscript_ogw_down_load_folderid' : folderId,
                };
                
                // MapReduceスクリプト　実行
                let taskId = mrScript.submit();
                
                // リンクパラメータ
                let linkParam = {
                        sortcol : "dcreated",
                        sortdir : "DESC",
                        date : "TODAY",
                        scripttype : soScript,
                };
                
                // URLジャンプ
                let linkUrl = url.resolveTaskLink({ id : "LIST_MAPREDUCESCRIPTSTATUS", params : linkParam });
                redirect.redirect({ url : linkUrl });
                
            };
        }
        
        // FORM作成
        const form = createForm(serverWidget);
        context.response.writePage(form);

    }
            
    return {
        onRequest : onRequest
    };
        
});
/**
 * 機能: 発注書・注文書一括ダウンロード　画面作成
 * @param {Object} serverWidget
 */
function createForm(serverWidget) {
    // フォーム名　セット
    let form = serverWidget.createForm({
        title : '発注書・注文書一括ダウンロード',
    });
    // クライアント・スクリプト　セット
    form.clientScriptModulePath = './ogw_cs_download_view.js';
    // 項目セット
    form.addButton({
        id : 'custpage_sw_body_csv', 
        label : 'ダウンロード', 
        functionName : 'pdfDownload()',
    });
    form.addButton({
        id : 'custpage_sw_body_cancel', 
        label : 'クリア', 
        functionName : 'cancel()',
    });
    form.addFieldGroup({
        id : 'fieldgroupid_output_object',
        label : '出力対象 *',
    });
    form.addField({
        id: "custpage_body_output", 
        type: serverWidget.FieldType.RADIO, 
        source: "output_po", 
        label: "発注書", 
        container : 'fieldgroupid_output_object',
    });
    form.addField({
        id: "custpage_body_output", 
        type: serverWidget.FieldType.RADIO, 
        source: "output_so", 
        label: "注文書", 
        container : 'fieldgroupid_output_object',
    });
    form.addFieldGroup({
        id : 'fieldgroupid_search', 
        label : '検索条件',
    });
    form.addField({
        id : 'custpage_body_date_from', 
        type : serverWidget.FieldType.DATE, 
        label : '開始日', 
        container : 'fieldgroupid_search',
    });
    form.addField({
        id : 'custpage_body_date_to', 
        type : serverWidget.FieldType.DATE, 
        label : '終了日', 
        container : 'fieldgroupid_search',
    });
    form.addField({
        id : 'custpage_body_vendor', 
        type : serverWidget.FieldType.SELECT, 
        label : '仕入先', 
        container : 'fieldgroupid_search', 
        source : 'vendor',
    });
    form.addField({
        id : 'custpage_body_customer', 
        type : serverWidget.FieldType.SELECT, 
        label : '顧客 ', 
        container : 'fieldgroupid_search', 
        source : 'customer',
    });
    return form;
};