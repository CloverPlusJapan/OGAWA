/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2023/01/10     CPC_‰‘
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
function clientFieldChanged(type, name, linenum){
 if(name=='custrecordogw_inquiries_employee'){
	 var employees=nlapiGetFieldValues('custrecordogw_inquiries_employee');
	 var employee=nlapiGetFieldValue('custrecordogw_inquiries_employee');
	 if(!isEmpty(employees)&&!isEmpty(employee)){
	 var inquiriesTxt='•¾ŽÐ‚Ì';
	 var employeeSearch = nlapiSearchRecord("employee",null,
			 [
			    ["internalid","anyof",employees]
			 ], 
			 [
			    new nlobjSearchColumn("altname")
			 ]
			 );
	 if(!isEmpty(employeeSearch)){
		 for(var j=0;j<employeeSearch.length;j++){			 
			 inquiriesTxt+=employeeSearch[j].getValue("altname");
			 if(employeeSearch.length>1&&j!=employeeSearch.length-1){
				 inquiriesTxt+='A';
			 }
		 }
		 inquiriesTxt+='‚Æ˜A—‚µ‚Ä‚­‚¾‚³‚¢B';
		 nlapiSetFieldValue('custrecord_ogw_inquiries', inquiriesTxt);
	 }
	 }else{
		 nlapiSetFieldValue('custrecord_ogw_inquiries', '');
	 }
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