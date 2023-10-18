/**
 * 機能: 発注書・注文書一括ダウンロード
 * Author: CPC_劉相坤
 * Date:2023/10/13
 * 
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['/SuiteScripts/common/juicerTemplateEngine.js', 'N/file', 'N/record', 'N/search', 'N/format', "N/runtime", 'N/render', "../common/common_ogw.js" ],
	/**
	 * @param {runtime}
	 *            runtime
	 * @param {search}
	 *            search
	 * @param {format}
	 *            format
	 */
	(juicerTemplateEngine, file, record, search, format, runtime, render, common) => {
		/**
		 * 入力データを生成
		 * 
		 * @returns {array|Object|Search|File}
		 * 
		 * @governance 10,000
		 */
		function getInputData() {
			
			// パラメータ取得
			let currentScript = runtime.getCurrentScript();
			let customer = currentScript.getParameter({name : 'custscript_ogw_down_load_customer'});
			let startDate = currentScript.getParameter({name : 'custscript_ogw_down_load_start'});
			let endDate = currentScript.getParameter({name : 'custscript_ogw_down_load_enddate'});
			let folderid = currentScript.getParameter({name : 'custscript_ogw_down_load_folderid'});
			let xmlFile = currentScript.getParameter({name : 'custscript_ogw_down_load_xmlFile'});
			
			// 注文書の検索
			let filtersArr = [
			                  ["type","anyof","SalesOrd"], 
			                  "AND", 
			                  ["customform","anyof","244"],
			                  "AND",
			                  ["mainline","is","T"]
			                 ];

			if ( customer ) filtersArr.push(
					'AND', 
					["customer.internalid","anyof",customer]
			);

			for ( let i = 0; i < 1; i++ ) {
                if ( startDate && endDate ) {
                	filtersArr.push(
                			'AND', 
                			["trandate", "within", startDate, endDate]
                	);
                    break;
                } else if ( startDate ) {
                    filtersArr.push(
                    		'AND', 
                    		["trandate", "onorafter", startDate]
                    );
                } else if ( endDate ) {
                    filtersArr.push(
                    		'AND', 
                    		["trandate", "onorbefore", endDate]
                    );
                };
            }
			
            let invoiceSearchObj = search.create({
                type: "salesorder",
                filters: filtersArr,
                columns: [
                          search.createColumn({
                        	  name: "internalid", 
                        	  label: "内部 ID",
                          })
                         ]
            });
		
            let mapJson = [];
            
            const soResults = common.getAllResults(invoiceSearchObj);
            // MAPデータ作成
            soResults.forEach((result)=>{
   				mapJson.push({
   					'soId' : result.getValue({
   						name: "internalid", 
   						label: "内部 ID",
   					}),
   					'datas' : folderid,
   					'xmlFile' : xmlFile
   				});
            });

            return mapJson;
		}

		/**
		 * 与えられた各キー/値のペアごとに処理を適用し、任意で次のステージにデータを渡す
		 * 
		 * @param {Object}
		 *            context
		 * @param {string}
		 *            context.key
		 * @param {string}
		 *            context.value
		 * @param {WriteFunc}
		 *            context.write
		 * @returns {undefined}
		 * 
		 * @governance 1,000
		 */
		function map(context) {

			// パラメータ取得
			const contextJson = JSON.parse(context.value);
	    	let id = contextJson['soId'];
	    	let folderId = contextJson['datas'];
	    	let xmlFile = contextJson['xmlFile'];

	    	let dataJson = {};
	    	// データ取得
            let memoRecord = record.load({
            	type: 'salesorder', 
            	id: id, 
            	isDynamic: true
            });

            let recordJson = dataJson.record = dataJson.record || {};
            recordJson.tranid = memoRecord.getValue("tranid");
            let  recid = memoRecord.getValue("createdfrom");
            recordJson.trandate = common.formatPdfDate1(memoRecord.getValue("trandate"));
            recordJson.cons = memoRecord.getValue("custbody_cons_add");
            recordJson.billaddress = memoRecord.getValue("billaddress");
            recordJson.ShippMark = memoRecord.getValue("custbody2");
            recordJson.ShippedPer = memoRecord.getValue("custbody6");
            recordJson.From = memoRecord.getValue("custbody7");
            recordJson.To = memoRecord.getValue("custbody8");
            recordJson.Payment = memoRecord.getValue("custbody_ps_paymenttermslong");
            recordJson.currency = memoRecord.getText("currency");
            recordJson.about = memoRecord.getValue("custbody9") ? format.format({type: format.Type.DATE, value: memoRecord.getValue("custbody9")}):"";
            recordJson.Via = memoRecord.getValue("custbody10");
            recordJson.LCNo = memoRecord.getValue("custbody11");
            recordJson.Reference = memoRecord.getValue("custbody12");
            recordJson.Incoterm = memoRecord.getText("custbody_me_incoterms");
            recordJson.subtotal = common.toThousands(Number(memoRecord.getValue("subtotal")));
            recordJson.total = common.toThousands(Number(memoRecord.getValue("total")));
            recordJson.message = memoRecord.getValue("message");
            recordJson.entity = memoRecord.getValue("shipaddress");
            dataJson.ShippMarkEach = memoRecord.getValue("custbody2") ? memoRecord.getValue("custbody2").split(/\n/g) : '';
    	    dataJson.shipaddressEach = recordJson.entity ? recordJson.entity.split(/\n/g) : '';
    	    dataJson.consEach = memoRecord.getValue("custbody_cons_add") ? memoRecord.getValue("custbody_cons_add").split(/\n/g) : '';
    	    recordJson.tax1amt = common.toThousands(Number(memoRecord.getValue("total")) -  Number(memoRecord.getValue("subtotal"))) || 0;
            
    	    let subArr = dataJson.sub = dataJson.sub || [];
            let taxJson = dataJson.tax = dataJson.tax || {};
            
            taxJson.eight =0;
            taxJson.eightAmt =0;
            taxJson.ten = 0;
            taxJson.tenAmt =0;
            
            let getLine = memoRecord.getLineCount({sublistId: 'item'});
            for ( let i = 0; i < getLine; i++ ) {
                let taxrate1 = memoRecord.getSublistValue({sublistId: "item", fieldId: "taxrate1", line: i});
                let tax1amt = memoRecord.getSublistValue({sublistId: "item", fieldId: "tax1amt", line: i});
                let amount = memoRecord.getSublistValue({sublistId: "item", fieldId: "amount", line: i});
                let res = {};
                res.num = i + 1;
                res.custcol_eta = memoRecord.getSublistValue({sublistId: "item", fieldId: "custcol_eta", line: i}) ? format.format({type: format.Type.DATE, value: memoRecord.getSublistValue({sublistId: "item", fieldId: "custcol_eta", line: i})}):"";
                res.quantity = memoRecord.getSublistValue({sublistId: "item", fieldId: "quantity", line: i})
                res.PACKING = memoRecord.getSublistValue({sublistId: "item", fieldId: "description", line: i})
                res.description = memoRecord.getSublistValue({sublistId: "item", fieldId: "custcol1", line: i})
                res.custcol7 = memoRecord.getSublistValue({sublistId: "item", fieldId: "custcol7", line: i})
                res.itemNum = memoRecord.getSublistValue({sublistId: "item", fieldId: "item_display", line: i}).split("_")[0]||"";
                res.unit = memoRecord.getSublistText({sublistId: "item", fieldId: "units", line: i})
                res.rate = common.toThousands(Number(memoRecord.getSublistValue({sublistId: "item", fieldId: "rate", line: i})))
                res.custcol4 = memoRecord.getSublistValue({sublistId: "item", fieldId: "custcol4", line: i})
                res.amount = common.toThousands(Number(memoRecord.getSublistValue({sublistId: "item", fieldId: "amount", line: i})))
                
                if (taxrate1 =="8") {
                    taxJson.eight = common.toThousands(Number(  taxJson.eight||0)+Number(tax1amt));
                    taxJson.eightAmt = common.toThousands(Number(  taxJson.eightAmt||0)+Number(amount));
                }
                // 10% の場合[税別に合計額を算出]
                if (taxrate1 =="10"){
                    taxJson.ten = common.toThousands(Number(  taxJson.ten||0)+Number(tax1amt));
                    taxJson.tenAmt = common.toThousands( Number(  taxJson.tenAmt||0)+Number(amount));
                }
                // 配列にセット
                subArr.push(res);
            }

            // PDFテンプレート取得
            let printXml = file.load({id: xmlFile});
            let template = printXml.getContents();
            let xmlstr = juicer(template, dataJson);
            
            let fileObj = render.xmlToPdf({
				xmlString : xmlstr
			});
            
            // PDFファイル作成
			fileObj.name = recordJson.tranid + '.pdf';
	        fileObj.folder = folderId;
	        let fileId = fileObj.save();
	        log.debug('fileId', fileId);
		}
		
		/**
		 * 関数呼び出しごとに1つだけのキーとそれに対応する値を処理
		 * 
		 * @param {Object}
		 *            context
		 * @param {Date}
		 *            context.dateCreated スクリプトが実行を開始した日時
		 * @param {number}
		 *            context.seconds スクリプトの処理中に経過した秒数
		 * @param {Object}
		 *            context.inputSummary
		 * @param {Object}
		 *            context.mapSummary
		 * @param {Object}
		 *            context.reduceSummary
		 * @param context.output
		 * @returns {undefined}
		 * 
		 * @governance 10,000
		 */
		function summarize(context) {
			log.debug(' 注文書一括ダウンロード - END ');
		}
		
		return {
		    getInputData: getInputData,
		    map: map,
	        summarize: summarize
		}
	}
);
