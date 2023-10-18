/**
 * 機能: 発注書・注文書一括ダウンロード
 * Author: CPC_劉相坤
 * Date:2023/10/13
 * 
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

let formRecord;

define(['N/search', 'N/record', 'N/runtime', 'N/query', "N/format", "N/url", "../common/common_ogw.js" ], 

  function(search, record, runtime, query, format, url, common) {

	/**
	 * Function to be executed after page is initialized.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.mode - The mode in which the record is
	 *            being accessed (create, copy, or edit)
	 * 
	 * @since 2015.2
	 */
	function pageInit(scriptContext) {
		
		formRecord = scriptContext.currentRecord;

		// 顧客フィールドの無効化
		formRecord.getField({
			fieldId: 'custpage_body_customer'
		}).isDisabled = true;
		
		// 仕入先フィールドの無効化
		formRecord.getField({
			fieldId: 'custpage_body_vendor'
		}).isDisabled = true;

	}
	/**
	 * Function to be executed when field is changed.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * @param {string}
	 *            scriptContext.fieldId - Field name
	 * @param {number}
	 *            scriptContext.lineNum - Line number. Will be undefined
	 *            if not a sublist or matrix field
	 * @param {number}
	 *            scriptContext.columnNum - Line number. Will be
	 *            undefined if not a matrix field
	 * 
	 * @since 2015.2
	 */
	function fieldChanged(scriptContext) {
		
		// RADIOの場合
		if ( scriptContext.fieldId == "custpage_body_output" ) {
			
			// RADIOの取得
			let output = scriptContext.currentRecord.getValue({
				fieldId : "custpage_body_output"
			});
			// 仕入先の取得
			let vendor = scriptContext.currentRecord.getField({
    		    fieldId: 'custpage_body_vendor'
    		});
			// 顧客の取得
			let customer = scriptContext.currentRecord.getField({
    		    fieldId: 'custpage_body_customer'
    		});
			
			// 発注書の場合、仕入先オプション
			if ( output == 'output_po' ) {
				vendor.isDisabled = false;
				customer.isDisabled = true;
			} else {// 注文書の場合、顧客オプション
				vendor.isDisabled = true;
				customer.isDisabled = false;
			}
		
		};
		
	}

	function pdfDownload() {
		
		// 実行可能フラグ
		let dataCountFlag = true;
		// 発注書・注文書RADIO
		let output = formRecord.getValue('custpage_body_output');
		// 開始日
		let dateFrom = common.paramsDate(formRecord.getValue('custpage_body_date_from'));
		// 終了日
		let dateTo = common.paramsDate(formRecord.getValue('custpage_body_date_to'));
		// 仕入先
		let vendor = formRecord.getValue('custpage_body_vendor');
		// 顧客
		let customer = formRecord.getValue('custpage_body_customer');
		
		// 出力対象が選択されていない場合、メッセージ表示
		if ( !output ) {
			alert('出力対象を選択してください。');
			return false;
		}
		
		// 発注書の場合
		if ( output == 'output_po' ) {
			// 発注書データ検索
			dataCountFlag = poToPdfSearch(dateFrom, dateTo, vendor);
		} else {// 注文書の場合
			// 注文書データ検索
			dataCountFlag = soToPdfSearch(dateFrom, dateTo, customer);
		} 
		
		// データが存在する場合
		if (dataCountFlag) {
			
			// パラメータ設定
			let params = {
					output : output,
					date_from : dateFrom,
					date_to : dateTo,
					vendor : vendor,
					customer : customer,
					flag : true,
			};
			
			// URLジャンプ
			let returnUrl=  url.resolveScript({
				scriptId:"customscript_ogw_sl_download_view", 
				deploymentId:"customdeploy_ogw_sl_download_view", 
				params:params
			});

			window.onbeforeunload = null;
            window.location.href = returnUrl;
		
		};
	
	}
	
	function poToPdfSearch(dateFrom, dateTo, vendor){
		
		// 発注書の検索
		let filtersArr = [
		                  ["type","anyof","PurchOrd"], 
		                  "AND", 
		                  ["customform","anyof","243"],
		                  "AND",
		                  ["mainline","is","T"]
		                 ];
        
		if (vendor) filtersArr.push('AND', ["vendor.internalid","anyof",vendor]);
		
		if (!common.isEmpty(dateFrom) && !common.isEmpty(dateTo)) {
			filtersArr.push(
					'AND', 
					["trandate","within",dateFrom,dateTo]
			);
	    } else if (!common.isEmpty(dateFrom) && common.isEmpty(dateTo)){
	    	filtersArr.push(
	    			'AND', 
	    			["trandate","onorafter",dateFrom]
	    	);
	    } else if (common.isEmpty(dateFrom) && !common.isEmpty(dateTo)){
	    	filtersArr.push(
	    			'AND', 
	    			["trandate","onorbefore",dateTo]
	    	);
	    }
    
		let invoiceSearchObj = search.create({
            type: "purchaseorder",
            filters: filtersArr,
            columns: [
                      search.createColumn({name: "internalid"})
                     ]
        });
        
		// 取得結果数
		let searchResultCount = invoiceSearchObj.runPaged().count;
		if (searchResultCount == 0) {
			alert('該当データがありません。');
			return false;	
		}
		
		return true;
	
	}
	
	function soToPdfSearch(dateFrom, dateTo, customer){
		
		// 注文書の検索
		let filtersArr = [
		                  ["type","anyof","SalesOrd"], 
		                  "AND", 
		                  ["customform","anyof","244"],
		                  "AND",
		                  ["mainline","is","T"]
		                 ];
        
		if (customer) filtersArr.push('AND', ["customer.internalid","anyof",customer]);
		
		if (!common.isEmpty(dateFrom) && !common.isEmpty(dateTo)) {
			filtersArr.push(
					'AND', 
					["trandate","within",dateFrom,dateTo]
			);
	    } else if (!common.isEmpty(dateFrom) && common.isEmpty(dateTo)) {
	    	filtersArr.push(
	    			'AND',
	    			["trandate","onorafter",dateFrom]
	    	);
	    } else if (common.isEmpty(dateFrom) && !common.isEmpty(dateTo)) {
	    	filtersArr.push(
	    			'AND',
	    			["trandate","onorbefore",dateTo]
	    	);
	    }
    
		let invoiceSearchObj = search.create({
            type: "salesorder",
            filters: filtersArr,
            columns: [search.createColumn({name: "internalid"}),]
        });

		// 取得結果数
		let searchResultCount = invoiceSearchObj.runPaged().count;
		if ( searchResultCount == 0 ) {
			alert('該当データがありません。');
			return false;	
		}
		
		return true;
		
	}
	
	function cancel(){
		// ページ内容のクリア
		formRecord.setValue({
			fieldId: 'custpage_body_output_po', 
			value: false
		});
		formRecord.setValue({
			fieldId: 'custpage_body_output_so', 
			value: false
		});
		formRecord.setValue({
			fieldId: 'custpage_body_date_from', 
			value: ''
		});
		formRecord.setValue({
			fieldId: 'custpage_body_date_to', 
			value: ''
		});
		formRecord.setValue({
			fieldId: 'custpage_body_vendor', 
			value: ''
		});
		formRecord.setValue({
			fieldId: 'custpage_body_customer', 
			value: ''
		});
		
	}
	
	return {
		pageInit : pageInit,
		fieldChanged : fieldChanged,
		pdfDownload : pdfDownload,
		cancel : cancel
	};
	
});
