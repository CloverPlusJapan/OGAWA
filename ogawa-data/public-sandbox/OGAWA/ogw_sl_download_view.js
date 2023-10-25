/**
 * 機能: 発注書・注文書一括ダウンロード
 * Author: CPC_劉相坤
 * Date:2023/10/13
 * 
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/ui/serverWidget', 'N/search', 'N/runtime', 'N/task', 'N/file', 'N/format', 'N/record', 'N/url', 'N/redirect', "../common/common_ogw.js", "N/error"], 
       
  function( serverWidget, search, runtime, task, file, format, record, url, redirect, common, error ) {
    
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
        if (flag == 'load') {
        	
            // 現在のScriptパラメータ値の取得
            let currentScript = runtime.getCurrentScript();
            let poScript = currentScript.getParameter({name:"custscript_po"});
            let soScript = currentScript.getParameter({name:"custscript_so"});
            let poFolder = currentScript.getParameter({name:"custscript_po_folder"});
            let soFolder = currentScript.getParameter({name:"custscript_so_folder"});
            let typeFlag = currentScript.getParameter({name:"custscript_type_flag"});
            let poName = currentScript.getParameter({name:"custscript_po_name"});
            let soName = currentScript.getParameter({name:"custscript_so_name"});
            let deploymentId = '';
            let fileId = '';

            // 親フォルダ取得
            let oyafolderId = output == typeFlag ? poFolder : soFolder;
            // フォルダ名の作成
            let folderName = output == typeFlag ? poName + common.getTokyoDate( format, true ) : soName + common.getTokyoDate( format, true );
            
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
                        'custscript_down_pdf_folderId' : oyafolderId,
                };
                // 定期スクリプト　実行
                try{
                	let taskId = mrScript.submit();
            	}catch(e){
            		// エラー作成
            		let err_msg = e.message;
            		if(e.name == 'FAILED_TO_SUBMIT_JOB_REQUEST_1'){
            			err_msg = '発注書一括ダウンロード実行中です、しばらくしてから、再度実行してください。';
            		}
            		let errorObj = error.create({
            		    name: e.name,
            		    message: err_msg,
            		    notifyOff: false
            		});
            		throw errorObj;
            	}
            	deploymentId = '7389';
            	fileId = '162892';
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
                        'custscript_ogw_down_load_folderid' : oyafolderId,
                };
                
            	try{
                    // MapReduceスクリプト　実行
                    let taskId = mrScript.submit();
            	}catch(e){
            		
            		let err_msg = e.message;
            		if(e.name == 'MAP_REDUCE_ALREADY_RUNNING'){
            			err_msg = '注文書一括ダウンロード実行中です、しばらくしてから、再度実行してください。';
            		}
            		let errorObj = error.create({
            		    name: e.name,
            		    message: err_msg,
            		    notifyOff: false
            		});
            		throw errorObj;
            		
            	}
            	
            	deploymentId = '7390';
            	fileId = '162893';
            };
            
            // FORM作成
            const loadFileFrom = creataLoadFileFrom(serverWidget, deploymentId, fileId, search, output);
            context.response.writePage(loadFileFrom);
            
        }else if (flag == 'view') {
        	// 現在のScriptパラメータ値の取得
            let currentScript = runtime.getCurrentScript();
            let poScript = currentScript.getParameter({name:"custscript_po"});
            let soScript = currentScript.getParameter({name:"custscript_so"});
            let poFolder = currentScript.getParameter({name:"custscript_po_folder"});
            let soFolder = currentScript.getParameter({name:"custscript_so_folder"});
            let typeFlag = currentScript.getParameter({name:"custscript_type_flag"});
            let poName = currentScript.getParameter({name:"custscript_po_name"});
            let soName = currentScript.getParameter({name:"custscript_so_name"});
            let deploymentId = context.request.parameters.deploymentId;
            let fileId = context.request.parameters.fileId;
        	// FORM作成
            const loadFileFrom = creataLoadFileFrom(serverWidget, deploymentId, fileId, search, output);
            context.response.writePage(loadFileFrom);
        }else{
        	// FORM作成
            const form = createForm(serverWidget);
            context.response.writePage(form);
        }
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
    }).updateDisplayType({
    	displayType : serverWidget.FieldDisplayType.DISABLED
    });
    form.addField({
        id : 'custpage_body_customer', 
        type : serverWidget.FieldType.SELECT, 
        label : '顧客 ', 
        container : 'fieldgroupid_search', 
        source : 'customer',
    }).updateDisplayType({
    	displayType : serverWidget.FieldDisplayType.DISABLED
    });
    return form;
};

function creataLoadFileFrom(serverWidget, DEPLOYMENT_ID, FILE_ID, search, outPut){

	log.debug('DEPLOYMENT_ID', DEPLOYMENT_ID);
	log.debug('FILE_ID', FILE_ID);
	
	
    var form = serverWidget.createForm({
    	title : "発注書・注文書一括ダウンロード",
    });

    form.clientScriptModulePath = './ogw_cs_download_view.js';
    
    form.addButton({
    	id : "searchFile",
    	label : "最新化",
    	functionName : 'pdfDownloadView("' + outPut + '");',
    })
    
    form.addButton({
    	id : "downloadFile",
    	label : "ダウンロード",
    	functionName : "downloadFile()",
    });

    // 実行情報
    form.addFieldGroup({
    	id : 'custpage_run_info', 
    	label : '実行情報',
    });

    // バッチ状態
    var batchStatus = getScheduledScriptRunStatus(DEPLOYMENT_ID, search);
    if (batchStatus == 'FAILED') {
        
    	// 実行失敗の場合
        var runstatusField = form.addField({
        	id : 'custpage_run_info_status', 
        	type : 'text',
        	label : ' ',
        	container : 'custpage_run_info',
        });

        runstatusField.updateDisplayType({
        	displayType : serverWidget.FieldDisplayType.INLINE
        });

        runstatusField.setDisplayType({
        	type : "inline"
        });

        var messageColour = '<font color="red"> バッチ処理を失敗しました </font>';
        runstatusField.defaultValue = messageColour;
    
    } else if (batchStatus == 'PENDING' || batchStatus == 'PROCESSING') {
        
    	// 実行中の場合
        var runstatusField = form.addField({
        	id : 'custpage_run_info_status', 
        	type : 'text',
        	label : ' ',
        	container : 'custpage_run_info'
        });

        runstatusField.updateDisplayType({
        	displayType: serverWidget.FieldDisplayType.INLINE
        });

        runstatusField.defaultValue = 'バッチ処理を実行中';
    }else {
        
    	// 処理完成の場合
    	var runstatusField = form.addField({
    		id : 'custpage_run_info_status', 
    		type : 'text',
    		label : ' ',
    		container : 'custpage_run_info'
    	});

    	runstatusField.updateDisplayType({
    		displayType : serverWidget.FieldDisplayType.INLINE
    	});

    	runstatusField.defaultValue='処理完成しました。';
    
    }
    
    var subList = form.addSublist({
    	id : 'custpage_sublist', 
    	type : serverWidget.SublistType.LIST, 
    	label : '一覧'
    });

    subList.addButton({
    	id : 'custpage_sublist_btn_mark_all', 
    	label : 'すべてをマーク', 
    	functionName : 'MarkAll'
    		
    });
    
    subList.addButton({
    	id : 'custpage_sublist_btn_previous_unmark_all', 
    	label : 'すべてのマークを外す', 
    	functionName : 'unmarkAll'
    		
    });
    
    subList.addField({
    	id: 'custpage_sublist_checkbox', 
    	type : serverWidget.FieldType.CHECKBOX, 
    	label : '選択'
    		
    });
    
    subList.addField({
    	id : 'custpage_sublist_date', 
    	type : serverWidget.FieldType.TEXT, 
    	label : '日付'
    		
    });
    
    subList.addField({
    	id : 'custpage_sublist_file_name', 
    	type : serverWidget.FieldType.TEXT, 
    	label : 'ファイル名'
    		
    });
    
    let url = subList.addField({
    	id: 'custpage_sublist_file_url', 
    	type : serverWidget.FieldType.TEXT, 
    	label : 'url'
    		
    });
    
    url.updateDisplayType({
    	displayType: serverWidget.FieldDisplayType.HIDDEN
    	
    });
    
    var fileSearchObj = search.create({
        type : "file",
        filters : [["folder","anyof",FILE_ID]],
        columns :
            [
                search.createColumn({name: "name", sort: search.Sort.ASC, label: "名称"}),
                search.createColumn({name: "url", label: "文件URL"}),
                search.createColumn({name: "created", sort: search.Sort.DESC,}),
            ]
    });
    
    var count = fileSearchObj.runPaged().count;
    
    if (count == 0 ) return form;
    
    let index = 0;
    
    fileSearchObj.run().each(function(result){
        subList.setSublistValue({
        	id : "custpage_sublist_file_name", 
        	line : index, 
        	value : result.getValue('name')
        	
        });
        
        subList.setSublistValue({
        	id : "custpage_sublist_date", 
        	line : index, 
        	value : result.getValue('created')
        	
        });
        
        subList.setSublistValue({
        	id : "custpage_sublist_file_url", 
        	line : index, 
        	value : result.getValue('url')
        	
        });
        
        index ++;
        
        return true;
        
    });
    return form;
}

function getScheduledScriptRunStatus(deploymentId, search){
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