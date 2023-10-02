/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(
		['N/ui/serverWidget', 'N/search', 'N/runtime'],
		function(serverWidget, search, runtime) {
			function onRequest(context) {
					
				const form = createForm(serverWidget);
				context.response.writePage(form);

			}
			return {
				onRequest : onRequest
			};
		});

function createForm(serverWidget) {
	var form = serverWidget.createForm({
		title : 'アイテム価格改定履歴一覧'
	});

	form.clientScriptModulePath = './ogw_cs_list_of_purchasing.js';
	
	form.addButton({
		id : 'custpage_sw_body_csv',
		label : 'CSV出力',
		functionName : 'csvExport()'
	});
	
	form.addButton({
		id : 'custpage_sw_body_cancel',
		label : 'クリア',
		functionName : 'cancel()'
	});
	
	form.addFieldGroup({
		id : 'fieldgroupid_search',
		label : '検索条件'
	});
	
	form.addField({
		id : 'custpage_body_date_from',
		type : serverWidget.FieldType.DATE,
		label : '開始日',
		container : 'fieldgroupid_search'
	})
	
	form.addField({
		id : 'custpage_body_date_to',
		type : serverWidget.FieldType.DATE,
		label : '終了日',
		container : 'fieldgroupid_search'
	})
	
	form.addField({
		id : 'custpage_body_item',
		type : serverWidget.FieldType.SELECT,
		label : 'アイテム',
		container : 'fieldgroupid_search',
		source : 'inventoryitem'
	});
	
	// ブランク項目・位置調整用
    form.addField({
    	id: 'custpage_sw_body_blank2',
    	type: serverWidget.FieldType.LABEL,
    	label: '　',
    	container: 'fieldgroupid_search',
    });
    
    
	
	form.addField({
		id : 'custpage_body_vendor',
		type : serverWidget.FieldType.SELECT,
		label : '仕入先',
		container : 'fieldgroupid_search',
		source : 'vendor'
	});
	
	form.addField({
		id : 'custpage_body_purchasecontract',
		type : serverWidget.FieldType.SELECT,
		label : '購入契約',
		container : 'fieldgroupid_search',
		source : 'purchasecontract'
	});
	
	// ブランク項目・位置調整用
    form.addField({
    	id: 'custpage_sw_body_blank1',
    	type: serverWidget.FieldType.LABEL,
    	label: '　',
    	container: 'fieldgroupid_search',
    });
	
	form.addField({
		id : 'custpage_body_latest_price',
		type : serverWidget.FieldType.CHECKBOX,
		label : '最新価格のみ',
		container : 'fieldgroupid_search',
	});
	
	return form;
}