
/**
 * 機能: 消費税に関するレポート出力
 * Author: 宋金来
 *  Date : 2023/09/12
 *
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord' , 'N/search' , 'N/format' , 'N/ui/dialog', 'N/format','N/runtime'],

    function (currentRecord , search,  format,  dialog,format,runtime) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
        }

        function reportExcel() {
            debugger
            var currentRec = currentRecord.get();
            var vendor = currentRec.getValue('custpage_vendor');
            var dataFrom = isEmpty(paramsDate(currentRec.getValue('custpage_date_from')))? "": formatDate(currentRec.getValue('custpage_date_from'));
            var dataTo = isEmpty(paramsDate(currentRec.getValue('custpage_date_to'))) ? "" :formatDate(currentRec.getValue('custpage_date_to'));
            var options = {vendor: vendor, startDate: dataFrom, endDate: dataTo}
            var  dataJson =  searchBillOGJTax(options);
            if (isEmpty(dataJson)){
                alert(" 該当データありません。")
                return;
            }
            loadExcelMessage(dataJson);
        }

        /**
         * 解析日オブジェクト
         * @param boolean
         * @param date
         * @returns {string|*}
         */
        function paramsDate(date) {
            if (typeof (date) == 'string') return date;
            YYYY = date.getFullYear() + "";
            MM = (date.getMonth() + 1)
            MM = MM < 10 ? "0" + MM : MM;
            DS = date.getDate()
            DS = DS < 10 ? "0" + DS : DS;
            return YYYY +"/"+ MM +"/"+ DS
        }

        /**
         * excelのダウンロード
         */
        function  loadExcelMessage(dataJson){
            var xmlString = '	<?xml version="1.0"?>	 ';
            xmlString += '	<?mso-application progid="Excel.Sheet"?>	 ';
            xmlString += '	<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"	 ';
            xmlString += '	 xmlns:o="urn:schemas-microsoft-com:office:office"	 ';
            xmlString += '	 xmlns:x="urn:schemas-microsoft-com:office:excel"	 ';
            xmlString += '	 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"	 ';
            xmlString += '	 xmlns:html="http://www.w3.org/TR/REC-html40">	 ';
            xmlString += '	 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">	 ';
            xmlString += '	  <Author>Lay song</Author>	 ';
            xmlString += '	  <LastAuthor>Lay song</LastAuthor>	 ';
            xmlString += '	  <Created>2023-09-28T03:58:23Z</Created>	 ';
            xmlString += '	  <Version>16.00</Version>	 ';
            xmlString += '	 </DocumentProperties>	 ';
            xmlString += '	 <OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office">	 ';
            xmlString += '	  <AllowPNG/>	 ';
            xmlString += '	 </OfficeDocumentSettings>	 ';
            xmlString += '	 <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">	 ';
            xmlString += '	  <WindowHeight>12165</WindowHeight>	 ';
            xmlString += '	  <WindowWidth>28800</WindowWidth>	 ';
            xmlString += '	  <WindowTopX>32767</WindowTopX>	 ';
            xmlString += '	  <WindowTopY>32767</WindowTopY>	 ';
            xmlString += '	  <ProtectStructure>False</ProtectStructure>	 ';
            xmlString += '	  <ProtectWindows>False</ProtectWindows>	 ';
            xmlString += '	 </ExcelWorkbook>	 ';
            xmlString += '	 <Styles>	 ';
            xmlString += '	  <Style ss:ID="Default" ss:Name="Normal">	 ';
            xmlString += '	   <Alignment ss:Vertical="Center"/>	 ';
            xmlString += '	   <Borders/>	 ';
            xmlString += '	   <Font ss:FontName="宋体" x:CharSet="134" ss:Size="11" ss:Color="#000000"/>	 ';
            xmlString += '	   <Interior/>	 ';
            xmlString += '	   <NumberFormat/>	 ';
            xmlString += '	   <Protection/>	 ';
            xmlString += '	  </Style>	 ';
            xmlString += '	  <Style ss:ID="s66">	 ';
            xmlString += '	   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>	 ';
            xmlString += '	  </Style>	 ';
            xmlString += '	  <Style ss:ID="s67">	 ';
            xmlString += '	   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>	 ';
            xmlString += '	   <Font ss:FontName="宋体" x:CharSet="134" ss:Size="12.8"/>	 ';
            xmlString += '	  </Style>	 ';
            xmlString += '	 </Styles>	 ';
            xmlString += '	 <Worksheet ss:Name="Sheet1">	 ';
            xmlString += '	  <Table ss:ExpandedColumnCount="9999" ss:ExpandedRowCount="9999" x:FullColumns="1"	 ';
            xmlString += '	   x:FullRows="1" ss:DefaultColumnWidth="54" ss:DefaultRowHeight="14.25">	 ';
            xmlString += '	   <Column ss:AutoFitWidth="0" ss:Width="105" ss:Span="6"/>	 ';
            xmlString += '	   <Row ss:Height="15">	 ';
            xmlString += '	    <Cell ss:StyleID="s66"><Data ss:Type="String">仕入先</Data></Cell>	 ';
            xmlString += '	    <Cell ss:StyleID="s67"><Data ss:Type="String">勘定科目</Data></Cell>	 ';
            xmlString += '	    <Cell ss:StyleID="s66"><Data ss:Type="String">取引通貨</Data></Cell>	 ';
            xmlString += '	    <Cell ss:StyleID="s66"><Data ss:Type="String">取引高</Data></Cell>	 ';
            xmlString += '	    <Cell ss:StyleID="s66"><Data ss:Type="String">税率</Data></Cell>	 ';
            xmlString += '	    <Cell ss:StyleID="s66"><Data ss:Type="String">消費税額</Data></Cell>	 ';
            xmlString += '	    <Cell ss:StyleID="s66"><Data ss:Type="String">適格請求書番号</Data></Cell>	 ';
            xmlString += '	   </Row>	 ';
            for (const key in dataJson) {
                xmlString += '	   <Row>	 ';
                xmlString += '	    <Cell><Data ss:Type="String">'+dataJson[key].vendor+'</Data></Cell>	 ';
                xmlString += '	    <Cell><Data ss:Type="String">'+dataJson[key].account+'</Data></Cell>	 ';
                xmlString += '	    <Cell><Data ss:Type="String">'+dataJson[key].currency+'</Data></Cell>	 ';
                xmlString += '	    <Cell><Data ss:Type="Number">'+dataJson[key].amount+'</Data></Cell>	 ';
                xmlString += '	    <Cell><Data ss:Type="String">'+dataJson[key].taxItem+'</Data></Cell>	 ';
                xmlString += '	    <Cell><Data ss:Type="Number">'+dataJson[key].taxAmt+'</Data></Cell>	 ';
                xmlString += '	    <Cell><Data ss:Type="String">'+dataJson[key].invoice_number+'</Data></Cell>	 ';
                xmlString += '	   </Row>	 ';
            }
            xmlString += '	  </Table>	 ';
            xmlString += '	  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">	 ';
            xmlString += '	   <PageSetup>	 ';
            xmlString += '	    <Header x:Margin="0.3"/>	 ';
            xmlString += '	    <Footer x:Margin="0.3"/>	 ';
            xmlString += '	    <PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/>	 ';
            xmlString += '	   </PageSetup>	 ';
            xmlString += '	   <Selected/>	 ';
            xmlString += '	   <Panes>	 ';
            xmlString += '	    <Pane>	 ';
            xmlString += '	     <Number>3</Number>	 ';
            xmlString += '	     <ActiveRow>4</ActiveRow>	 ';
            xmlString += '	     <ActiveCol>6</ActiveCol>	 ';
            xmlString += '	    </Pane>	 ';
            xmlString += '	   </Panes>	 ';
            xmlString += '	   <ProtectObjects>False</ProtectObjects>	 ';
            xmlString += '	   <ProtectScenarios>False</ProtectScenarios>	 ';
            xmlString += '	  </WorksheetOptions>	 ';
            xmlString += '	 </Worksheet>	 ';
            xmlString += '	</Workbook>	 ';
            var uri = 'data:application/vnd.ms-excel;base64,';
            var a = document.createElement("a");
            a.href = uri + base64(xmlString);
            a.download =`TAXREPORT_${new Date().Format("yyyyMMdd hhmmss")}.xls`;
            a.click();
        }

        /**
         *  base 64エンコーディング
         * @param s
         * @returns {string}
         */
        function base64(s) {
            return window.btoa(unescape(encodeURIComponent(s)));
        }

        Date.prototype.Format = function(fmt) {
            this.setHours(this.getHours() +1);
            var o = {
                "y+": this.getFullYear(),
                "M+": this.getMonth() + 1,
                "d+": this.getDate(),
                "h+": this.getHours(),
                "m+": this.getMinutes(),
                "s+": this.getSeconds(),
                "q+": Math.floor((this.getMonth() + 3) / 3),
                "S+": this.getMilliseconds()
            };
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    if (k == "y+") {
                        fmt = fmt.replace(
                            RegExp.$1,
                            ("" + o[k]).substr(4 - RegExp.$1.length)
                        );
                    } else if (k == "S+") {
                        var lens = RegExp.$1.length;
                        lens = lens == 1 ? 3 : lens;
                        fmt = fmt.replace(
                            RegExp.$1,
                            ("00" + o[k]).substr(("" + o[k]).length - 1, lens)
                        );
                    } else {
                        fmt = fmt.replace(
                            RegExp.$1,
                            RegExp.$1.length == 1
                                ? o[k]
                                : ("00" + o[k]).substr(("" + o[k]).length)
                        );
                    }
                }
            }
            return fmt;
        };

        /**
         * 請求書の検索
         * @param options
         * @returns {{}}
         */
        function searchBillOGJTax(options) {
            var dataJson = {};
            var billFilter = [ ["type", "anyof", "VendBill"] , "AND" , ["customform","anyof" , "242"] , "AND" , ["taxline" , "is" , "F"] , "AND" , ["mainline" , "is" , "F"] ];
            if (options.vendor){
                billFilter.push('AND' , ["vendor.internalid" , "anyof" , options.vendor]);
            } else {
                billFilter.push("AND" , [ ["vendor.entityid" , "startswith" , "31"] , "OR" , ["vendor.entityid" , "is" , "10195"] ] );
            }
            for (var i = 0; i < 1; i++) {
                if (options.startDate  &&  options.endDate) {
                    billFilter.push('AND', ["trandate", "within", options.startDate, options.endDate]);
                    break;
                } else if (options.startDate) {
                    billFilter.push('AND', ["trandate", "onorafter", options.startDate]);
                } else if (options.endDate) {
                    billFilter.push('AND', ["trandate", "onorbefore", options.endDate]);
                }
            }
            var vendorbillSearchObj = search.create({
                type: "vendorbill",
                filters: billFilter,
                columns:
                    [
                        search.createColumn({name: "account"}),
                        search.createColumn({name: "altname" ,  join: "vendor"}),
                        search.createColumn({name: "internalid" ,  join: "vendor"}),
                        search.createColumn({name: "currency"}),
                        search.createColumn({name: "fxamount"}),
                        search.createColumn({name: "formulanumeric", formula: "{fxamount}*({taxItem.rate}/100)"}),
                        search.createColumn({name: "rate" , join: "taxItem"}),
                        search.createColumn({name: "custentity_qualified_invoice_number" , join: "vendor"}),
                    ]
            });
            var columns = vendorbillSearchObj.columns;
            var  resultArr = getAllResults(vendorbillSearchObj);
            if (!isEmpty(resultArr)){
                for (var i = 0; i < resultArr.length; i++) {
                    var vendor = resultArr[i].getValue(columns[2]);
                    var account = resultArr[i].getValue(columns[0]);
                    var taxItem = resultArr[i].getValue(columns[6]);
                    var currency = resultArr[i].getValue(columns[3]);
                    var  key  = vendor+"_"+account+"_"+taxItem+"_"+currency;
                    var bodyJson = dataJson[key] =  dataJson[key]||{};
                    bodyJson.vendor = resultArr[i].getValue(columns[1]);
                    bodyJson.account = resultArr[i].getText(columns[0]);
                    bodyJson.taxItem = taxItem;
                    bodyJson.currency = resultArr[i].getText(columns[3]);
                    bodyJson.invoice_number = resultArr[i].getValue(columns[7]);
                    bodyJson.amount =Number(bodyJson.amount||0)+ Math.abs(Number(resultArr[i].getValue(columns[4])));
                    bodyJson.taxAmt =Number(bodyJson.taxAmt||0)+ Math.abs(Number(resultArr[i].getValue(columns[5])));
                }
            }
            return dataJson;
        }

        /**
         *ページ条件をクリア
         */
        function clearPage(){
            var currentRec = currentRecord.get();
            currentRec.setValue({fieldId:"custpage_vendor", value:""});
            currentRec.setValue({fieldId:"custpage_date_from", value:null});
            currentRec.setValue({fieldId:"custpage_date_to", value:null});
        }

        /**
         * @param mySearch
         * @returns {[]}
         */
        const getAllResults = (mySearch) => {
            var resultSet = mySearch.run();
            var resultArr = [];
            var start = 0;
            var step = 1000;
            var results = resultSet.getRange({start: start, end: step});
            while (results && results.length > 0) {
                resultArr = resultArr.concat(results);
                start = Number(start) + Number(step);
                results = resultSet.getRange({start: start, end: Number(start) + Number(step)});
            }
            return resultArr;
        }

        /**
         * 非空判定
         * @param obj
         * @returns {boolean}
         */
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
            for (var key in obj) {
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

        function formatDate(isDate) {
            var userObj = runtime.getCurrentUser();
            var userFormat = userObj.getPreference({
                name: "DATEFORMAT"
            });
            userFormat = userFormat.replace(/YYYY/, isDate.getFullYear());
            if (userFormat.indexOf("MM") < 0 && userFormat.indexOf("M") >= 0) {
                userFormat = userFormat.replace(/M/, isDate.getMonth() + 1);
            } else {
                userFormat = userFormat.replace(/MM/, isDate.getMonth() + 1);
            }
            if (userFormat.indexOf("DD") < 0 && userFormat.indexOf("D") >= 0) {
                userFormat = userFormat.replace(/D/, isDate.getDate());
            } else {
                userFormat = userFormat.replace(/DD/, isDate.getDate());
            }
            return userFormat;
        }


        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            reportExcel: reportExcel,
            clearPage:clearPage
        };

    });
