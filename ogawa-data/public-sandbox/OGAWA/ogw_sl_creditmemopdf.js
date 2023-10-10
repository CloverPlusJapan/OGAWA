/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['/SuiteScripts/common/juicerTemplateEngine.js', 'N/file', 'N/record', 'N/search', 'N/format'],

    (juicerTemplateEngine, file, record, search, format) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var request = scriptContext.request;
            var response = scriptContext.response;
            var id = request.parameters.dateId;
            var type = request.parameters.type
            var dataJson = {};
            // レコードロード処理
            var memoRecord = record.load({type: record.Type.CREDIT_MEMO, id: id, isDynamic: true});
            let recordJson = dataJson.record = dataJson.record || {};
            recordJson.tranid = memoRecord.getValue("tranid");
            let  recid = memoRecord.getValue("createdfrom");
            let dataObj ={};
            try{
                dataObj = search.lookupFields({type:record.Type.INVOICE,id:recid,columns:['trandate']})
            }catch (e){
                dataObj =  search.lookupFields({type:record.Type.RETURN_AUTHORIZATION,id:recid,columns:['trandate']})
            }
            recordJson.date = dataObj?.trandate||"";
            recordJson.cons = memoRecord.getValue("custbody_cons_add");
            recordJson.billaddress = memoRecord.getValue("billaddress");
            recordJson.ShippMark = memoRecord.getValue("custbody2");

            recordJson.ShippedPer = memoRecord.getValue("custbody6");
            recordJson.From = memoRecord.getValue("custbody7");
            recordJson.To = memoRecord.getValue("custbody8");
            recordJson.Payment = memoRecord.getValue("terms");
            recordJson.currency = memoRecord.getText("currency");

            recordJson.about = memoRecord.getValue("custbody9") ? format.format({type: format.Type.DATE, value: memoRecord.getValue("custbody9")}):"";
            recordJson.Via = memoRecord.getValue("custbody10");
            recordJson.LCNo = memoRecord.getValue("custbody11");
            recordJson.Reference = memoRecord.getValue("custbody12");
            recordJson.Incoterm = memoRecord.getValue("custbody_me_incoterms");

            recordJson.subtotal = toThousands(Number(memoRecord.getValue("subtotal")));
            recordJson.total = toThousands(Number(memoRecord.getValue("total")));
            recordJson.message = memoRecord.getValue("message");
            // 2023.10.10 F.Saito add start ***
            // 日付を取得
            recordJson.trandate = memoRecord.getValue("trandate") ? format.format({type: format.Type.DATE, value: memoRecord.getValue("trandate")}):"";
            // 2023.10.10 F.Saito add end   ***

            let subArr = dataJson.sub = dataJson.sub || [];

            let taxJson = dataJson.tax = dataJson.tax || {};
            taxJson.eight =0;
            taxJson.eightAmt =0;
            taxJson.ten = 0
            taxJson.tenAmt =0;

            // 行ごとにデータ設定
            var getLine = memoRecord.getLineCount({sublistId: 'item'});
            for (let i = 0; i < getLine; i++) {
                let taxrate1 = memoRecord.getSublistValue({sublistId: "item", fieldId: "taxrate1", line: i})
                let tax1amt = memoRecord.getSublistValue({sublistId: "item", fieldId: "tax1amt", line: i})
                let amount = memoRecord.getSublistValue({sublistId: "item", fieldId: "amount", line: i})
                let res = {};
                res.num = i + 1;
                // 2023.10.05 F.Saito add start ***
                // 納品日(ETA)を追加
                res.custcol_eta = memoRecord.getSublistValue({sublistId: "item", fieldId: "custcol_eta", line: i}) ? format.format({type: format.Type.DATE, value: memoRecord.getSublistValue({sublistId: "item", fieldId: "custcol_eta", line: i})}):"";
                // 2023.10.05 F.Saito add end   ***
                res.quantity = memoRecord.getSublistValue({sublistId: "item", fieldId: "quantity", line: i})
                res.PACKING = memoRecord.getSublistValue({sublistId: "item", fieldId: "description", line: i})
                res.description = memoRecord.getSublistValue({sublistId: "item", fieldId: "custcol1", line: i})
                res.itemNum = memoRecord.getSublistValue({sublistId: "item", fieldId: "item_display", line: i}).split("_")[0]||"";
                res.unit = memoRecord.getSublistText({sublistId: "item", fieldId: "units", line: i})
                res.rate = toThousands(Number(memoRecord.getSublistValue({sublistId: "item", fieldId: "rate", line: i})))
                res.amount =toThousands(Number(memoRecord.getSublistValue({sublistId: "item", fieldId: "amount", line: i})))
                // 8% の場合[税別に合計額を算出]
                if (taxrate1 =="8") {
                    taxJson.eight =toThousands(Number(  taxJson.eight||0)+Number(tax1amt))
                    taxJson.eightAmt =toThousands(Number(  taxJson.eightAmt||0)+Number(amount))
                }
                // 10% の場合[税別に合計額を算出]
                if (taxrate1 =="10"){
                    taxJson.ten = toThousands(Number(  taxJson.ten||0)+Number(tax1amt))
                    taxJson.tenAmt =toThousands( Number(  taxJson.tenAmt||0)+Number(amount))
                }
                // 配列にセット
                subArr.push(res);
            }
            // XML呼び出し
            var printXml = file.load({id: '118655'})
            var template = printXml.getContents();
            var xmlstr = juicer(template, dataJson);
            response.renderPdf({xmlString: xmlstr});
        }


        /**
         * 文字列を数値に変換
         * @param num
         * @returns {string}
         */
        function toThousands(num){
            return (num||0).toString().replace(/(\d)(?=(?:\d{3})+$)/g,'$1,');
        }


        return {onRequest}
    });
