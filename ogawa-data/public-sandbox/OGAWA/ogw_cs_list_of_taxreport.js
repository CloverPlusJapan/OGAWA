/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/search', 'N/format', 'N/ui/dialog'],

    function (currentRecord, search, format, dialog) {

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
                // jQuery("input[id='reportExcel']").attr("disabled","true");//按钮禁用
                // let Buttonkey = window.localStorage.getItem("Buttonkey"); // 从浏览器localStorage获取储存的json信息
                //  if (!isEmpty(Buttonkey)){
                //  alert("二重押下チェックを行う!")
                //      return;
                //  }
                let currentRec = currentRecord.get();
                let vendor = currentRec.getValue('custpage_vendor');
                let dataFrom = paramsDate(currentRec.getValue('custpage_date_from'));
                let dataTo = paramsDate(currentRec.getValue('custpage_date_to'));
                let options = {vendor: vendor, startDate: dataFrom, endDate: dataTo}
                let  dataJson =  searchBillOGJTax(options);
                loadExcelMessage(dataJson);
                // window.localStorage.setItem("Buttonkey", false);
        }

        /**
         * 解析日期对象
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
         * 下载 excel
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
            xmlString += '	   <Font ss:FontName="等线" x:CharSet="134" ss:Size="11" ss:Color="#000000"/>	 ';
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
                xmlString += '	    <Cell><Data ss:Type="String"></Data></Cell>	 ';
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
            var a = document.createElement("a");                                                                   // 为了给xls文件命名，重新创建一个a元素
            a.href = uri + base64(xmlString);                                                                               // 给a元素设置 href属性
            a.download =`TAXREPORT_${new Date().Format("yyyyMMdd hhmmss")}.xls`;                          // 给a元素设置下载名称
            a.click();

        }

        /**
         * 输出base64编码
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
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S+": this.getMilliseconds() //毫秒
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

        function searchBillOGJTax(options) {
            var dataJson = {};
            var billFilter = [["type", "anyof", "VendBill"], "AND", ["customform", "anyof", "248"], "AND", ["taxline", "is", "F"], "AND", ["mainline", "is", "F"]];

                log.audit("options ", options);
                if (options.vendor){
                    billFilter.push('AND', ["vendor.internalid", "anyof", options.vendor]);
                } else {
                    billFilter.push("AND",[ ["vendor.entityid", "startswith", "31"], "OR", ["vendor.entityid", "is", "10195"]]);
                }
            for (let i = 0; i < 1; i++) {
                if (options.startDate && options.endDate) {
                    billFilter.push('AND', ["trandate", "within", options.startDate, options.endDate]);
                    break;
                } else if (options.startDate) {
                    billFilter.push('AND', ["trandate", "onorafter", options.startDate]);
                } else if (options.endDate) {
                    billFilter.push('AND', ["trandate", "onorbefore", options.endDate]);
                }
            }
            log.audit("billFilter",billFilter );

            var vendorbillSearchObj = search.create({
                type: "vendorbill",
                filters: billFilter,
                columns:
                    [
                        search.createColumn({name: "account", label: "科目"}),
                        search.createColumn({name: "altname", join: "vendor", label: "名称"}),
                        search.createColumn({name: "internalid", join: "vendor", label: "内部 ID"}),
                        search.createColumn({name: "currency", label: "货币"}),
                        search.createColumn({name: "amount", label: "金额"}),
                        search.createColumn({name: "taxamount", label: "金额（事务处理税总计）"}),
                        search.createColumn({name: "rate", join: "taxItem", label: "税率"})
                    ]
            });
            let columns = vendorbillSearchObj.columns;
            let  resultArr = getAllResults(vendorbillSearchObj);
            if (!isEmpty(resultArr)){
                for (let i = 0; i < resultArr.length; i++) {
                    let vendor = resultArr[i].getValue(columns[2]);
                    let account = resultArr[i].getValue(columns[0]);
                    let taxItem = resultArr[i].getValue(columns[6]);
                    let  key  = vendor+"_"+account+"_"+taxItem;
                    let bodyJson = dataJson[key] =  dataJson[key]||{};
                    bodyJson.vendor = resultArr[i].getValue(columns[1]);
                    bodyJson.account = resultArr[i].getText(columns[0]);
                    bodyJson.taxItem = taxItem;
                    bodyJson.currency = resultArr[i].getText(columns[3]);
                    bodyJson.amount =Number(bodyJson.amount||0)+ Math.abs(Number(resultArr[i].getValue(columns[4])));
                    bodyJson.taxAmt =Number(bodyJson.taxAmt||0)+ Math.abs(Number(resultArr[i].getValue(columns[5])));
                }
            }
            return dataJson;
        }

        function clearPage(){
            debugger
            let currentRec = currentRecord.get();
            currentRec.setValue({fieldId:"custpage_vendor",value:""});
            currentRec.setValue({fieldId:"custpage_date_from",value:null});
            currentRec.setValue({fieldId:"custpage_date_to",value:null});
        }

        /**
         * 通用方法校验
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
         * 非空判断
         * @param obj 各种类型
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


        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            reportExcel: reportExcel,
            clearPage:clearPage
        };

    });
