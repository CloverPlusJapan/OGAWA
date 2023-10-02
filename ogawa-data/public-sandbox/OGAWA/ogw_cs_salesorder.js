/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/02/08     CPC_‘v
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */

var so_ogj_custForm = '244'
	
	
//change by song add 23030423 start
function clientPageInit(type){
	if(type=='copy'){
		nlapiSetFieldValue('otherrefnum', '');
	}	
}
	
//change by song add 23030423 end


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
	try{
		if(name == 'porate' || name == 'item' || name == 'quantity'){
			var customForm = nlapiGetFieldValue('customform');
			if(customForm == so_ogj_custForm){
				if(!isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))){	
					var poRate = parseFloat(nlapiGetCurrentLineItemValue('item', 'porate'));
					if(isNaN(poRate)){
						nlapiSetCurrentLineItemValue('item', 'custcol_ogw_forecast_rate','',false,true);
						nlapiSetCurrentLineItemValue('item', 'custcol_ogw_predictor','',false,true);
					}else{
						nlapiSetCurrentLineItemValue('item', 'custcol_ogw_forecast_rate',poRate,false,true);
						var quantity = nlapiGetCurrentLineItemValue('item', 'quantity');
						nlapiSetCurrentLineItemValue('item', 'custcol_ogw_predictor',parseFloatAdd(poRate,quantity),false,true);
					}
				}
			}
		}
	}catch(e){
		
	}
}


function clientSaveRecord(){
	try{
	var soCustform = nlapiGetFieldValue('customform');
	if(soCustform == so_ogj_custForm){
		var isdropshipitemArr = new Array();
		var itemCount = nlapiGetLineItemCount('item');
		for(var i = 1 ; i < itemCount + 1 ; i ++){
			 if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
			var itemId = nlapiGetLineItemValue('item', 'item', i);
			if(!isEmpty(itemId)){
				var isdropshipitem = nlapiLookupField('item', itemId, 'isdropshipitem')//
				isdropshipitemArr.push(isdropshipitem);
			}									
		   }
		}
		var itemflgArr = unique1(isdropshipitemArr);
		
		// only T or F itemflgArr.length=1 else itemflgArr.length > 1 need alert error message
		if(itemflgArr.length > 1 ){
			if(confirm("Note: including Drop Shipment Item and Non Drop shipment item")){
			}else{
				return false;
			}
		}
	  }
	return true;
	}catch(e){}
}


function parseFloatAdd(a, b) {
	return Number((parseFloat(a) * parseFloat(b)).toFixed(2));
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