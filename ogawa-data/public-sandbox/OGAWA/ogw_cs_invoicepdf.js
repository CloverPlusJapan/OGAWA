/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/02/10    CPC_�v
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */



function pdfStart() {
   
    var theLink = nlapiResolveURL('SUITELET', 'customscript_ogw_sl_invoicepdf','customdeploy_ogw_sl_invoicepdf');
	theLink+='&invoiceid='+nlapiGetRecordId();
	window.open(theLink);

}
