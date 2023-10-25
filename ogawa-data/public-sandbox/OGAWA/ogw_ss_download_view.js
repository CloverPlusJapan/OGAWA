/**
 * Version    Date            Author           Remarks
 * 1.0       2023 /10/13	CPC_劉相坤
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	
	var dateFrom = nlapiGetContext().getSetting('SCRIPT','custscript_down_pdf_date_from');
	var dateTo = nlapiGetContext().getSetting('SCRIPT','custscript_down_pdf_date_to');
	var vendor = nlapiGetContext().getSetting('SCRIPT','custscript_down_pdf_vendor');
	var folderId = nlapiGetContext().getSetting('SCRIPT','custscript_down_pdf_folderId');
	
	poToPdf(dateFrom, dateTo, vendor, folderId);

}

function poToPdf(dateFrom, dateTo, vendor, folderId){
	
	var filit = new Array();
    filit.push(["type","anyof","PurchOrd"]);
    filit.push("AND");
    filit.push(["customform","anyof","243"]);
    filit.push("AND");
    filit.push(["mainline","is","T"]);
    if ( !isEmpty(dateFrom) && !isEmpty(dateTo) ) {
        filit.push("AND");
        filit.push(["trandate","within",dateFrom,dateTo]);
    } else if ( !isEmpty(dateFrom) && isEmpty(dateTo) ) {
    	filit.push("AND");
    	filit.push(["trandate","onorafter",dateFrom]);
    } else if ( isEmpty(dateFrom) && !isEmpty(dateTo) ) {
    	filit.push("AND");
    	filit.push(["trandate","onorbefore",dateTo]);
    }

    if ( !isEmpty(vendor) ) {
        filit.push("AND");
        filit.push(["vendor.internalid","anyof",vendor]);
    }
	
	var purchaseorderSearch = getSearchResults(
			"purchaseorder",
			null,
			filit,
			[
			   new nlobjSearchColumn("internalid")
			]
	);
	
	if ( purchaseorderSearch != null && purchaseorderSearch.length > 0 ) {
		nlapiLogExecution("debug", "purchaseorderSearch.length ", purchaseorderSearch.length);
		for ( var i = 0; i < purchaseorderSearch.length; i++ ) {
			var poid = purchaseorderSearch[i].getValue("internalid");
			getpoPdf(poid, '2', folderId);
		}
	}

}

function getpoPdf(poId, type, folderId){
	
	try{
		nlapiLogExecution("debug", "purchaseorder", poId);
		
	    var poRecord=nlapiLoadRecord('purchaseorder', poId);
	    var tranid = poRecord.getFieldValue('tranid');
	    var trandate = poRecord.getFieldValue('trandate');
	    if(!isEmpty(trandate)){
	        var trandateJp = getOgawaDate(trandate);
	    }
	    
	    var entityId = poRecord.getFieldValue('entity');
	    var entityRecord = nlapiLookupField('entity', entityId, ['entityid','custentity_ogw_entity_name']);
	    var vendorId = entityRecord.entityid;
	    var vendorName = entityRecord.custentity_ogw_entity_name;
	    var entityTo='';
	    if(!isEmpty(vendorName)){
	        entityTo = specialString(vendorName);
	    }
	    var subsidiaryId = poRecord.getFieldValue('subsidiary');
	    var subsidiarySearch= getSearchResults("subsidiary",null,
	        [
	            ["internalid","anyof",subsidiaryId]
	        ],
	        [
	            new nlobjSearchColumn("legalname"),
	            new nlobjSearchColumn("address1","address",null),
	            new nlobjSearchColumn("address2","address",null),
	            new nlobjSearchColumn("city","address",null),
	            new nlobjSearchColumn("zip","address",null),
	        ]
	    );
	    var address1= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("address1","address",null)));
	    var address2= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("address2","address",null)));
	    var address3= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("city","address",null)));
	    var zip= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("zip","address",null)));
	    var legaValue= defaultEmpty(isEmpty(subsidiarySearch) ? '' :  transfer(subsidiarySearch[0].getValue("legalname")));
	    var country='';
	    if(!isEmpty(subsidiaryId)){
	        if(subsidiaryId == '1'){
	            country = 'SG';
	        }else if(subsidiaryId == '2'){
	            country = '中国';
	        }else if(subsidiaryId == '3'){
	            country = 'Thailand';
	        }else if(subsidiaryId == '4'){
	            country = 'Singapore';
	        }
	    }
	    var billaddress = poRecord.getFieldValue('billaddress');
	    var custbody2 = poRecord.getFieldValue('custbody2');
	    var custbody_cons_add = poRecord.getFieldValue('custbody_cons_add');
	    var terms  = poRecord.getFieldText('terms');//
	    var custbody_me_incoterms = poRecord.getFieldValue('custbody_me_incoterms');
	    var itemList = poRecord.getLineItemCount('item');
	    var poTempJParr = new Array();
	    var poTempEngarr = new Array();
	    var polanuagArr = new Array();
	    var filePoArr = new Array();
	    var filePoArr1 = new Array();
	    var inquiriesArr = new Array();
	    var cancleFlag=poRecord.getFieldValue('custbody_ogw_cancle');
	    var changeFlag=poRecord.getFieldValue('custbody_ogw_po_change');
	    var message = poRecord.getFieldValue('message');
	    var messageValuespe = '';
	    var messageValue = '';
	    if(!isEmpty(message)){
	        messageValuespe = meaning(message);
	        if(!isEmpty(messageValuespe)){
	            messageValue = specialString(messageValuespe);
	        }
	    }
	    var custbody2 = poRecord.getFieldValue('custbody2');
	    var custbody2Value = '';
	    if(!isEmpty(custbody2)){
	        custbody2Value = meaning(custbody2);
	    }

	    var amountTotal = 0;
	    var grossamtArrEn = 0;
	    var amountTotalEn = 0;
	    var taxamountJpyTotalEn = 0;
	    var taxamountTotalJpyEn = 0;
	    var amountArr_eightEn = 0;
	    var amountTotal_eightEn = 0;
	    var taxamountArr_eightEn = 0;
	    var taxamountTotal_eightEn = 0;
	    var amountArr_tenEn = 0;
	    var amountTotal_tenEn = 0;
	    var taxamountArr_tenEn = 0;
	    var taxamountTotal_tenEn = 0;
	    
	    if(itemList != 0) {
	        for(var s = 1; s <= itemList; s++){
	            var item = poRecord.getLineItemText('item', 'item', s).split("_")[0];//アイテム
	            var itemNum = defaultEmpty(poRecord.getLineItemValue('item', 'custcol_number', s));//NUM
	            var pdfTemp = poRecord.getLineItemValue('item', 'custcol_ogw_po_pdf_temp', s);//発注書PDFテンプレート
	            var itmeLine = defaultEmpty(poRecord.getLineItemValue('item', 'line', s));//行
	            var custcol7 = defaultEmpty(poRecord.getLineItemValue('item', 'custcol7', s));
	            var custcol_etd = defaultEmpty(poRecord.getLineItemValue('item', 'custcol_etd', s));
	            var custcol_eta = poRecord.getLineItemValue('item', 'custcol_eta', s);
	            if(!isEmpty(custcol_eta)){
	                nlapiLogExecution("debug", "PDF ETA", custcol_eta);
	                var etaJp = getOgawaDate(custcol_eta);
	            }else{
	                var etaJp = '';
	            }
	            var custcol1 = defaultEmpty(poRecord.getLineItemValue('item', 'custcol1', s));
	            var quantity = defaultEmpty(parseFloat(poRecord.getLineItemValue('item', 'quantity', s)));
	            var units_display = defaultEmpty(poRecord.getLineItemValue('item', 'units_display', s));
	            if(pdfTemp == '1'){
	                var ogw_inquiries = defaultEmpty(poRecord.getLineItemValue('item', 'custcol_ogw_inquiries', s));
	                var inquiriesValue = '';
	                if(!isEmpty(ogw_inquiries)){
	                    inquiriesValue = ogw_inquiries.replace(/。/g,'。<br/>');
	                    inquiriesArr.push(inquiriesValue);
	                }
	            }
	            var descriptionText = defaultEmpty(poRecord.getLineItemValue('item','description',s));//説明
	            var description='';
	            if(!isEmpty(descriptionText)){
	                description = specialString(descriptionText);
	            }

	            var ratePrinting = poRecord.getLineItemValue('item', 'custcol_ogw_individual_rate_printing', s);//独自レート(印刷用)
	            if(!isEmpty(ratePrinting)){
	                var rate = defaultEmpty(parseFloat(poRecord.getLineItemValue('item','custcol_ogw_unit_printing',s)));//単価(印刷用）
	                var amountPrinting = defaultEmpty(parseFloat(poRecord.getLineItemValue('item','custcol_ogw_amount_printing',s)));//総額(印刷用）
	                if(!isEmpty(amountPrinting)){
	                    amountTotal += parseFloat(amountPrinting);
	                    var amountTotalArr = formatNumber(amountTotal);
	                }
	            }else{
	                var rate = defaultEmpty(parseFloat(poRecord.getLineItemValue('item','rate',s)));//単価
	            }

//				 var rate = defaultEmpty(parseFloat(poRecord.getLineItemValue('item','rate',s)));//単価
	            if(!isEmpty(rate)){
	                var rateFormat = rate.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	            }else{
	                var rateFormat = '';
	            }
	            var amount = defaultEmpty(parseFloat(poRecord.getLineItemValue('item','amount',s)));//金額
	            if(!isEmpty(amount)){
	                var invAmountFormat = amount.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	            }else{
	                var invAmountFormat = '';
	            }
	            
	            var grossamtEn = defaultEmpty(parseFloat(poRecord.getLineItemValue('item','grossamt',s)));//総額
	            if(!isEmpty(grossamtEn)){	  //金額(税入)合計
	                grossamtArrEn += parseFloat(grossamtEn);
	                amountTotalEn = formatNum(grossamtArrEn);
	            }
	            
	            var tax1amtEn = defaultEmpty(parseFloat(poRecord.getLineItemValue('item', 'tax1amt', s)));//税額
	            if(!isEmpty(tax1amtEn)){ //税額合計Jpy
	                taxamountJpyTotalEn += parseFloat(tax1amtEn);
	                taxamountTotalJpyEn = formatNumber(taxamountJpyTotalEn);
	            }
	            
	            var taxrate1En = defaultEmpty(poRecord.getLineItemValue('item','taxrate1',s));//税率
	            if(taxrate1En == '8.0%'){
	                if(!isEmpty(grossamtEn)){  //8%金額(税入)合計
	                    amountArr_eightEn += parseFloat(grossamtEn);
	                    amountTotal_eightEn = formatNum(amountArr_eightEn);
	                }

	                if(!isEmpty(tax1amtEn)){  //8%税額合計
	                    taxamountArr_eightEn += parseFloat(tax1amtEn);
	                    taxamountTotal_eightEn = formatNum(taxamountArr_eightEn);
	                }
	            }else if(taxrate1En == '10.0%'){
	                if(!isEmpty(grossamtEn)){	//10%金額(税入)合計
	                    amountArr_tenEn += parseFloat(grossamtEn);
	                    amountTotal_tenEn = formatNum(amountArr_tenEn);
	                }
	                if(!isEmpty(tax1amtEn)){   //10%税額合計
	                    taxamountArr_tenEn += parseFloat(tax1amtEn);
	                    taxamountTotal_tenEn = formatNum(taxamountArr_tenEn);
	                }
	            }
	            polanuagArr.push("2");
	            poTempEngarr.push({
	                item:item,
	                pdfTemp:pdfTemp,
	                itmeLine:itmeLine,
	                itemNum:itemNum,
	                custcol_etd:custcol_etd,
	                custcol1:custcol1,
	                quantity:quantity,
	                rateFormat:rateFormat,
	                invAmountFormat:invAmountFormat,
	                custcol7:custcol7,
	                custcol_eta:custcol_eta,
	                units_display:units_display,
	            });
	        }
	    }

	    var newPolanuagArrEng = unique1(polanuagArr);
	    var indexEng=newPolanuagArrEng.indexOf("2");
	    if(indexEng >= 0 ){
	        var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+ //英語PDF
	            '<pdf>'+
	            '<head>'+
	            '<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
	            '<#if .locale == "zh_CN">'+
	            '<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
	            '<#elseif .locale == "zh_TW">'+
	            '<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
	            'javascript:NLMultiButton_doAction(\'multibutton_pdfsubmit\', \'submitas\');return false;	<#elseif .locale == "ja_JP">'+
	            '<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
	            '<#elseif .locale == "ko_KR">'+
	            '<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
	            '<#elseif .locale == "th_TH">'+
	            '<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
	            '</#if>';
	        str += '<macrolist>';
	        str += '<macro id="nlheader">';
	        str += '<table class="header" style="width: 100%;"><tr>';
	        str += '<td rowspan="3" style="padding: 10px 0px 0px 0px;">';
	        str += '<div><#if companyInformation.logoUrl?length != 0><img src="${companyInformation.logoUrl}" style="position: absolute; top: -50px; margin: 0px; width: 100%; height: 100%; float: left;" /></#if></div>';
	        str += '</td>';
	        if(cancleFlag=='T' && changeFlag == 'F'){
	            str +='<td align="center" style="vertical-align:middle;border:4px solid red;font-size:40px;"><b style="color:red;">Cancel</b></td>';
	        }else if(changeFlag=='T' && cancleFlag == 'F'){
	            str +='<td align="center" style="vertical-align:middle;border:4px solid red;font-size:40px;"><b style="color:red;">Change Order</b></td>';
	        }else if(cancleFlag == 'T' && changeFlag == 'T'){
	            str +='<td align="center" style="vertical-align:middle;border:4px solid red;font-size:40px;"><b style="color:red;">Cancel</b></td>';
	        }
	        str += '<td align="right" style="padding: 10px 0px 0px 40px;"><span class="nameandaddress">'+legaValue+'</span><br /><span class="nameandaddress">'+address1+'<br />'+address2+'<br />'+address3+" "+zip+'<br />'+country+'</span><br /><span class="nameandaddress">GST register no: 201230468G</span></td>';
	        str += '</tr></table>';
	        str += ' </macro>';
	        str += '<macro id="nlfooter">';
	        str += '<table class="footer" style="width: 100%;"><tr>';
	        str += '<td>&nbsp;</td>';
	        str += '<!--<td align="right"><pagenumber/> of <totalpages/></td>-->';
	        str += '</tr></table>';
	        str += '</macro>';
	        str += '</macrolist>';
	        str += '<style type="text/css">* {';
	        str += '<#if .locale == "zh_CN">';
	        str += 'font-family: NotoSans, NotoSansCJKsc, sans-serif;';
	        str += '<#elseif .locale == "zh_TW">';
	        str += 'font-family: NotoSans, NotoSansCJKtc, sans-serif;';
	        str += '<#elseif .locale == "ja_JP">';
	        str += 'font-family: NotoSans, NotoSansCJKjp, sans-serif;';
	        str += '<#elseif .locale == "ko_KR">';
	        str += 'font-family: NotoSans, NotoSansCJKkr, sans-serif;';
	        str += '<#elseif .locale == "th_TH">';
	        str += 'font-family: NotoSans, NotoSansThai, sans-serif;';
	        str += '<#else>';
	        str += 'font-family: NotoSans, sans-serif;';
	        str += '</#if>';
	        str += '}';
	        str += 'table {font-size: 9pt;table-layout: fixed;}';
	        str += 'th {font-size: 8pt;vertical-align: middle;padding: 5px 6px 3px; color: #333333;}';
	        str += 'td {padding: 4px 6px;}';
	        str += 'td p { align:left }';
	        str += 'b {color: #333333;}';
	        str += 'table.header td {padding: 0;font-size: 10pt;}';
	        str += 'table.footer td {padding: 0;font-size: 8pt;}';
	        str += 'table.itemtable th {padding-bottom: 5px;padding-top: 5px;font-size: 8pt;}';
	        str += 'table.itemtable td {padding-bottom: 12px;padding-top: 12px;font-size: 7pt;}';
	        str += 'table.body td {padding-top: 2px;}';
	        str += 'table.total {padding: 0;font-size: 10pt;}';
	        str += 'tr.totalrow {background-color: #e3e3e3;line-height: 200%;}';
	        str += 'td.totalboxtop {font-size: 12pt;background-color: #e3e3e3;}';
	        str += 'td.addressheader {font-size: 8pt;padding-top: 6px;padding-bottom: 2px;}';
	        str += 'td.address {padding-top: 0;}';
	        str += 'td.totalboxmid {font-size: 28pt;padding-top: 20px;background-color: #e3e3e3;}';
	        str += 'td.totalboxbot {background-color: #e3e3e3;}';
	        str += 'span.title {font-size: 20pt;}';
	        str += 'span.number {font-size: 10pt;}';
	        str += 'span.itemname {line-height: 150%;}';
	        str += 'td.titleboxbot {border-left: 1px;border-bottom:1px;height:15px;line-height:15px;}';
	        str += '</style>';
	        str += '</head>';
	        str += '<body header="nlheader" header-height="12%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';
	        str += '<table style="width: 100%;border:0.6px;border-top-style: dashed;border-right-style: none;  border-bottom-style: none;  border-left-style: none;"><tr><td> &nbsp;</td></tr></table>';
	        str += '<table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tr>';
	        str += '<td align="right"><span class="title" aling="right">Purchase Order</span></td>';
	        str += '<td align="right">OGS Manage Number&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="number">${record.tranid}</span>';
	        str += '<br />Order Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="number">${record.trandate}</span></td>';
	        str += '</tr></table>';
	        str += '<table style="width: 100%;border:0.6px;border-top-style: dashed;border-right-style: none;  border-bottom-style: none;  border-left-style: none;">';
	        str += '<tr style="border-bottom:0.6px;border-bottom-style: dashed;">';
	        str += '<td class="addressheader" colspan="6" style="border-right:1px;border-right-style: solid;">vendor<br/><br/>'+entityTo+'<br />&nbsp;</td>';
	        str += '<td class="addressheader" colspan="5">&nbsp;</td>';
	        str += '</tr>';
	        str += '<tr>';
	        str += '<td class="addressheader" colspan="6" style="border-right:1px;border-right-style: solid;">Consignee<br/><br/>${record.custbody_cons_add}</td>';
	        str += '<td class="addressheader" colspan="5">Payment:&nbsp;&nbsp;&nbsp;&nbsp;${record.terms}<br /><br />Incoterm:&nbsp;&nbsp;&nbsp;&nbsp;${record.custbody_me_incoterms}<br /><br />Currency:&nbsp;&nbsp;&nbsp;&nbsp;${record.currency}<br /><br />Issued by:&nbsp;&nbsp;&nbsp;&nbsp;${record.employee}<br /></td>';
	        str += '</tr>';
	        str += '</table>';
	        str += '<table style="width: 100%;border:0.6px;border-top-style: none;border-right-style: none;  border-bottom-style: none;  border-left-style: none;"><tr><td> &nbsp;</td></tr></table>';
	        str += '<table style="width: 100%;border:0.6px;border-top-style: dashed;border-right-style: none;  border-bottom-style: none;  border-left-style: none;"><tr><td> &nbsp;</td></tr></table>';
	        str += '<table class="itemtable" style="width: 100%;border-bottom:none;" border="1" cellpadding="0" cellspacing="0">';
	        str += '<thead>';
	        str += '<tr>';
	        str += '<th align="left" colspan="2" style="border-bottom:1px;">&nbsp;&nbsp;No</th>';
	        str += '<th align="left" colspan="5" style="border-left: 1px;border-bottom:1px;" >&nbsp;&nbsp;Description</th>';
	        str += '<th align="left" colspan="4" style="border-left: 1px;border-bottom:1px;" >&nbsp;&nbsp;Cust. PO#</th>';
	        str += '<th align="left" colspan="3" style="border-left: 1px;border-bottom:1px;" >&nbsp;&nbsp;ETD</th>';
	        str += '<th align="left" colspan="3" style="border-left: 1px;border-bottom:1px;" >&nbsp;&nbsp;ETA</th>';
	        str += '<th align="left" colspan="6" style="border-left: 1px;border-bottom:1px;" >&nbsp;&nbsp;Packing Details</th>';
	        str += '<th align="left" colspan="3" style="border-left: 1px;border-bottom:1px;">&nbsp;&nbsp;Quantity</th>';
	        str += '<th align="left" colspan="4" style="border-left: 1px;border-bottom:1px;" >&nbsp;&nbsp;Unit Type</th>';
	        str += '<th align="left" colspan="4" style="border-left: 1px;border-bottom:1px;" >&nbsp;&nbsp;Unit Price</th>';
	        str += '<th align="left" colspan="4" style="border-left: 1px;border-bottom:1px;" >&nbsp;&nbsp;Amount</th>';
	        str += '</tr>';
	        for(var j =0;j<poTempEngarr.length;j++){
	            str += '<tr>';
	            str += '<td align="left" colspan="2" style="border-bottom: 1px;height:15px;line-height:15px;font-size:14px;">&nbsp;&nbsp;'+poTempEngarr[j].itemNum+'</td>';
	            str += '<td align="left" colspan="5" class="titleboxbot" style="font-size:14px;">&nbsp;&nbsp;'+poTempEngarr[j].item+'</td>';
	            str += '<td align="left" colspan="4" class="titleboxbot" style="font-size:14px;">&nbsp;&nbsp;'+poTempEngarr[j].custcol7+'</td>';
	            str += '<td align="left" colspan="3" class="titleboxbot" style="font-size:14px;">&nbsp;&nbsp;'+poTempEngarr[j].custcol_etd+'</td>';
	            str += '<td align="left" colspan="3" class="titleboxbot" style="font-size:14px;">&nbsp;&nbsp;'+poTempEngarr[j].custcol_eta+'</td>';
	            str += '<td align="left" colspan="6" class="titleboxbot" style="font-size:14px;">&nbsp;&nbsp;'+poTempEngarr[j].custcol1+'</td>';
	            str += '<td align="right" colspan="3" class="titleboxbot" style="font-size:14px;">'+poTempEngarr[j].quantity+'&nbsp;&nbsp;</td>';
	            str += '<td align="left" colspan="4" class="titleboxbot" style="font-size:14px;">&nbsp;&nbsp;'+poTempEngarr[j].units_display+'</td>';
	            str += '<td align="right" colspan="4" class="titleboxbot" style="font-size:14px;">'+poTempEngarr[j].rateFormat+'&nbsp;&nbsp;</td>';
	            str += '<td align="right" colspan="4" class="titleboxbot" style="font-size:14px;">'+poTempEngarr[j].invAmountFormat+'&nbsp;&nbsp;</td>';
	            str += '</tr>';
	        }
	        str += '</thead>';
	        str += '</table>';
	        str += '<table cellpadding="0" cellspacing="0" style="width: 100%;">';
	        str += '<tr>';
	        str += '<td style="width:59%;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>';
	        str += '<td style="border:1px;border-top:none;border-right:none;border-bottom:none; width:11%">&nbsp;&nbsp;合計（税込):</td>';
	        if(!isEmpty(amountTotalEn)){
	        	str += '<td style="width:11%" align="right">'+amountTotalEn+'</td>';
	        }else{
	        	str += '<td style="width:11%" align="right">&nbsp;</td>';
	        }
	        str += '<td style="width: 11%;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;消費税:</td>';
	        if(!isEmpty(taxamountTotalJpyEn)){
	        	str += '<td align="right" style="border-right:1px;">'+taxamountTotalJpyEn+'</td>';
	        }else{
	        	str += '<td align="right" style="border-right:1px;">&nbsp;</td>';
	        }
	        
	        str += '</tr>';
	        str += '<tr>';
	        str += '<td style="width:59%;">&nbsp;</td>';
	        str += '<td style="border:1px;border-top:none;border-right:none;border-bottom:none; width:11%">&nbsp;&nbsp;8%対象:</td>';
	        if(!isEmpty(amountTotal_eightEn)){
	        	str += '<td style="width:11%" align="right">'+amountTotal_eightEn+'</td>';
	        }else{
	        	str += '<td style="width:11%" align="right">&nbsp;</td>';
	        }
	        str += '<td style="width: 11%;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;消費税:</td>';
	        if(!isEmpty(taxamountTotal_eightEn)){
	        	str += '<td align="right" style="border-right:1px;">'+taxamountTotal_eightEn+'</td>';
	        }else{
	        	str += '<td align="right" style="border-right:1px;">&nbsp;</td>';
	        }
	        str += '</tr>';
	        str += '<tr>';
	        str += '<td style="width:59%;">&nbsp;</td>';
	        str += '<td style="border-bottom:1px;border-left:1px; width:11%">&nbsp;&nbsp;10%対象:</td>';
	        if(!isEmpty(amountTotal_tenEn)){
	        	str += '<td style="width:11%;border-bottom:1px;">'+amountTotal_tenEn+'</td>';
	        }else{
	        	str += '<td style="width:11%;border-bottom:1px;">&nbsp;</td>';
	        }
	        str += '<td style="width:11%;border-bottom:1px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;消費税:</td>';
	        if(!isEmpty(taxamountTotal_tenEn)){
	        	str += '<td align="right" style="width:11%;border-bottom:1px;border-right:1px;">'+taxamountTotal_tenEn+'</td>';
	        }else{
	        	str += '<td align="right" style="width:11%;border-bottom:1px;border-right:1px;">&nbsp;</td>';
	        }
	        
	        str += '</tr>';
	        str += '</table>';
	        
	        str += '</body>';
	        str += '</pdf>';
	        var renderer = nlapiCreateTemplateRenderer();
	        renderer.setTemplate(str);
	        var record=nlapiLoadRecord('purchaseorder', poId);
	        renderer.addRecord('record', record);
	        var xml = renderer.renderToString();
	        var xlsFile = nlapiXMLToPDF(xml);
	        // PDF
	        xlsFile.setName(tranid + '.pdf');
	        xlsFile.setFolder(folderId);
	        xlsFile.setIsOnline(true);
	        var fileID = nlapiSubmitFile(xlsFile);
	        nlapiLogExecution("debug", "fileID", fileID);
	    }
	}catch(e){
		nlapiLogExecution("debug", "getpoPdf error ", e.message);
	}
	
}

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
    for ( var key in obj) {
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

function unique1(arr){
    var hash=[];
    for (var i = 0; i < arr.length; i++) {
        if(hash.indexOf(arr[i])==-1){
            hash.push(arr[i]);
        }
    }
    return hash;
}

function defaultEmpty(src){
    return src || '';
}

function RondomStr(){
    var arr1 = new Array("0","1","2","3","4","5","6","7","8","9");
    var nonceStr=''
    for(var i=0;i<5;i++){
        var n = parseInt(Math.floor(Math.random()*5));
        nonceStr+=arr1[n];
    }
    return parseInt(nonceStr)
}

function getOgawaDate(str){
    try{
        if(!isEmpty(str) && str != ''){
            var etaJp = nlapiStringToDate(str);
            var etaJp_year = etaJp.getFullYear();
            var etaJp_month = etaJp.getMonth()+1;
            var etaJp_day = etaJp.getDate();
            date = (etaJp_year + '/' + etaJp_month + '/' + etaJp_day).toString();
            return date;
        }
    }catch(e){
        nlapiLogExecution("debug", "getOgawaDate 1", e.message);
    }
}

function specialString (str){
    var custName = str.indexOf("&");
    var specialText='';
    if(custName < 0 ){
        specialText = str;
    }else{
        var CustName1 = str.substring(0,custName);
        var CustName2 = str.substring(custName+1,str.length);
        specialText = CustName1 + "&amp;" + CustName2;
    }
    return specialText;
}

function transfer(text){
    if ( typeof(text)!= "string" )
        text = text.toString() ;

    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

    return text ;
}

function meaning (str){
    var meaningString = str.replace(/\n/g,'<br/>');
    return  meaningString;
}

function formatNum(num) {
    var numStr = num.toString().split('.');
    var numInt = numStr[0];
    var numDec = numStr.length > 1 ? '.'+numStr[1] : '.' ;
    while (3 - numDec.length)  numDec += '0';
    var resultInt = '';
    while (numInt.length > 3) {
        resultInt = ','+numInt.slice(-3)+resultInt;
        numInt = numInt.slice(0, -3);
    }
    return numInt + resultInt + numDec;
}

function formatNumber(num) {
    var numStr = num.toString().split('.');
    var numInt = numStr[0];
    var resultInt = '';
    while (numInt.length > 3) {
        resultInt = ','+numInt.slice(-3)+resultInt;
        numInt = numInt.slice(0, -3);
    }
    return numInt + resultInt ;
}

function toThousands(num){
    return (num||0).toString().replace(/(\d)(?=(?:\d{3})+$)/g,'$1,');
}

function getSearchResults(type, id, filters, columns) {
    var search = nlapiCreateSearch(type, filters, columns);

    // 検索し、結果を渡す
    var searchResult = search.runSearch();
    var maxCount = 0;
    var results = [];
  if(!isEmpty(searchResult)){
    var resultInfo;
    try{
    do {
        resultInfo = searchResult.getResults(maxCount, maxCount + 1000);
        if (!isEmpty(resultInfo)) {
            resultInfo.forEach(function(row) {
                results.push(row);
            });
        }
        maxCount += 1000;
    } while (resultInfo.length == 1000);
    }catch(e){}
   }
    return results;
}
