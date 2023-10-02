/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
var formRecord;
define(['N/search', 'N/record', 'N/runtime', 'N/query', 'N/file', "N/format"], function(search, record, runtime, query, file, format) {

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
//		var body_item = scriptContext.currentRecord.getField({
//		    fieldId: 'custpage_body_item'
//		});
//		var body_purchasecontract = scriptContext.currentRecord.getField({
//		    fieldId: 'custpage_body_purchasecontract'
//		});
//		body_purchasecontract.isDisabled = true;
//		body_item.isDisabled = false;
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

        if (scriptContext.fieldId == "custpage_body_latest_price") {
            var latest_price = scriptContext.currentRecord.getValue({
                fieldId : "custpage_body_latest_price"
            });
            var date_from = scriptContext.currentRecord.getField({
                fieldId: 'custpage_body_date_from'
            });
            var date_to = scriptContext.currentRecord.getField({
                fieldId: 'custpage_body_date_to'
            });
            if(latest_price){
                date_from.isDisabled = true;
                date_to.isDisabled = true;
                formRecord.setValue({fieldId: 'custpage_body_date_from', value: null});
                formRecord.setValue({fieldId: 'custpage_body_date_to', value: null});
            }else{
                date_from.isDisabled = false;
                date_to.isDisabled = false;
            }
        }

    }

    function csvExport() {
        debugger
        try{
            var csvFile = '"アイテム","種類","改定日付","価格水準","仕入先","購買契約","通貨","数量 ","価格';
            csvFile += '"\r\n';

            var getValueJson = [];

            // 日付-TO
            var body_date_to = formRecord.getValue({
                fieldId : "custpage_body_date_from"
            });
            // 日付-FROM
            var body_date_from = formRecord.getValue({
                fieldId : "custpage_body_date_to"
            });

            // アイテム
            var item = formRecord.getValue({
                fieldId : "custpage_body_item"
            });
            // 仕入先
            var vendor = formRecord.getValue({
                fieldId : "custpage_body_vendor"
            });
            // 購入契約
            var purchasecontract = formRecord.getValue({
                fieldId : "custpage_body_purchasecontract"
            });
            // 最新価格のみ
            var latest_price = formRecord.getValue({
                fieldId : "custpage_body_latest_price"
            });

            var searchData = getSearchData(body_date_to, body_date_from, item, vendor, purchasecontract,latest_price);
            if(latest_price){
                searchData = getNewSearchData(body_date_to, body_date_from, item, vendor, purchasecontract,latest_price);
            }

            if(searchData){
                csvFile += searchData;
                // ダウンロード
                var date = new Date();
                var date_format = date.getFullYear() + padZero(date.getMonth() + 1) +
                    padZero(date.getDate()) + padZero(date.getHours()) +
                    padZero(date.getMinutes()) + padZero(date.getSeconds());
                // UTF BOM
                var bom = new Uint8Array([ 0xEF, 0xBB, 0xBF ]);
                // リンククリエイト
                var downloadLink = document.createElement("a");
                downloadLink.download = 'CSVOUTPUT_' + date_format + ".csv";
                // ファイル情報設定
                downloadLink.href = URL.createObjectURL(new Blob([ bom, csvFile ], {
                    type : "text/csv"
                }));
                downloadLink.dataset.downloadurl = [ "text/csv", downloadLink.download,
                    downloadLink.href ].join(":");
                // イベント実行
                downloadLink.click();
            }
        }catch(e){
            alert(e.message);
        }
    }

    //先頭ゼロ付加
    function padZero(num) {
        let result;
        if (num < 10) {
            result = "0" + num;
        } else {
            result = "" + num;
        }
        return result;
    }

    function getSearchData(body_date_to, body_date_from, item, vendor, purchasecontract,latest_price){
        var csvLineGroup = '';
        var checkFlag = false;
        // 購買価格
        var purchasingPriceFlag = false;
        // 販売価格
        var sellingPriceFlag = false;

        if(!purchasecontract){
            purchasingPriceFlag = true;
            if(!vendor){
                sellingPriceFlag = true;
            }
        }

        if(sellingPriceFlag){
            // 販売価格?索
            var itemSearchObj = search.create({
                type: "inventoryitem",
                filters:
                    [
                        ["type","anyof","InvtPart"],
                        "AND",
                        ["isinactive","is","F"],
                        "AND",
                        ["systemnotes.field","anyof","INVTITEM.RUNITPRICE"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "date",
                            join: "systemNotes",
                            label: "日付",
                            sort: search.Sort.DESC,
                        }),
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.DESC,
                            label: "名前"
                        }),
                        search.createColumn({
                            name: "currency",
                            join: "pricing",
                            sort: search.Sort.DESC,
                            label: "通貨"
                        }),
                        search.createColumn({
                            name: "minimumquantity",
                            join: "pricing",
                            label: "最小数量"
                        }),
                        search.createColumn({
                            name: "maximumquantity",
                            join: "pricing",
                            label: "最大数量"
                        }),
                        search.createColumn({
                            name: "pricelevel",
                            join: "pricing",
                            sort: search.Sort.DESC,
                            label: "価格水準"
                        }),
                        search.createColumn({
                            name: "unitprice",
                            join: "pricing",
                            label: "単価"
                        }),
                        search.createColumn({name: "displayname", label: "表示名"})
                    ]
            });

            if(body_date_from && body_date_to){
                search.createFilter({
                    name : 'date',
                    join : 'systemnotes',
                    operator : 'onorbefore',
                    values : format.format({value : body_date_from, type : format.Type.DATE})
                });
                search.createFilter({
                    name : 'date',
                    join : 'systemnotes',
                    operator : 'onorafter',
                    values : format.format({value : body_date_to, type : format.Type.DATE})
                })
            }

            if(item){
                itemSearchObj.filters.push(
                    search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.ANYOF,
                        values: item
                    })
                );
            }
            csvLineGroup += getCsvLineDataValue(getAllResults(itemSearchObj), 'a', checkFlag);
        }

        if(purchasingPriceFlag){
            var vendorSearchObj = search.create({
                type: "inventoryitem",
                filters:
                    [
                        ["type","anyof","InvtPart"],
                        "AND",
                        ["isinactive","is","F"],
                        "AND",
                        ["systemnotes.field","anyof","INVTITEM.PRICELIST"]
                    ],
                columns:
                    [
                        search.createColumn({name: "vendorcost", label: "仕入先価格"}),
                        search.createColumn({name: "cost", label: "購入価格"}),
                        search.createColumn({name: "othervendor", label: "仕入先"}),
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.DESC,
                            label: "名前"
                        }),
                        search.createColumn({
                            name: "date",
                            join: "systemNotes",
                            sort: search.Sort.DESC,
                            label: "日付"
                        }),
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.DESC,
                            label: "名前"
                        }),
                        search.createColumn({name: "vendorpricecurrency", label: "仕入先価格通貨"}),
                        search.createColumn({name: "displayname", label: "表示名"})
                    ]
            });

            if(body_date_from && body_date_to){
                search.createFilter({
                    name : 'date',
                    join : 'systemnotes',
                    operator : 'onorbefore',
                    values : format.format({value : body_date_from, type : format.Type.DATE})
                });
                search.createFilter({
                    name : 'date',
                    join : 'systemnotes',
                    operator : 'onorafter',
                    values : format.format({value : body_date_to, type : format.Type.DATE})
                })
            }

            if(item){
                vendorSearchObj.filters.push(
                    search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.ANYOF,
                        values: item
                    })
                );
            }

            if(vendor){
                vendorSearchObj.filters.push(
                    search.createFilter({
                        name: 'othervendor',
                        operator: search.Operator.ANYOF,
                        values: vendor
                    })
                );
            }
            csvLineGroup += getCsvLineDataValue(getAllResults(vendorSearchObj), 'b', checkFlag);
        }

        var purchasecontractSearchObj = search.create({
            type: "purchasecontract",
            filters:
                [
                    ["type","anyof","PurchCon"],
                    "AND",
                    ["mainline","is","F"],
                    "AND",
                    ["voided","is","F"],
                ],
            columns:
                [
                    search.createColumn({
                        name: "date",
                        join: "lineSystemNotes",
                        sort: search.Sort.DESC,
                        label: "日付"
                    }),
                    search.createColumn({
                        name: "fromquantity",
                        join: "itemPricing",
                        label: "数量から"
                    }),
                    search.createColumn({
                        name: "rateorlotprice",
                        join: "itemPricing",
                        label: "単価またはロット価格"
                    }),
                    search.createColumn({
                        name: "newvalue",
                        join: "lineSystemNotes",
                        label: "変更後"
                    }),
                    search.createColumn({name: "line", label: "ラインID"}),
                    search.createColumn({
                        name: "field",
                        join: "lineSystemNotes",
                        label: "フィールド"
                    }),
                    search.createColumn({name: "item", label: "アイテム"}),
                    search.createColumn({name: "entity", label: "名前"}),
                    search.createColumn({name: "tranid", label: "ドキュメント番号"}),
                    search.createColumn({name: "currency", label: "通貨"}),
                    search.createColumn({
                        name: "displayname",
                        join: "item",
                        label: "表示名"
                    })
                ]
        });

        if(body_date_from && body_date_to){
            search.createFilter({
                name : 'date',
                join : 'linesystemnotes',
                operator : 'onorbefore',
                values : format.format({value : body_date_from, type : format.Type.DATE})
            });
            search.createFilter({
                name : 'date',
                join : 'linesystemnotes',
                operator : 'onorafter',
                values : format.format({value : body_date_to, type : format.Type.DATE})
            })
        }

        if(item){
            purchasecontractSearchObj.filters.push(
                search.createFilter({
                    name: 'item',
                    operator: search.Operator.ANYOF,
                    values: item
                })
            );
        }

        if(vendor){
            purchasecontractSearchObj.filters.push(
                search.createFilter({
                    name : 'internalid',
                    join : 'vendor',
                    operator: search.Operator.ANYOF,
                    values : vendor
                })
            );
        }

        if(purchasecontract){
            purchasecontractSearchObj.filters.push(
                search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.ANYOF,
                    values: purchasecontract
                })
            );
        }
        csvLineGroup += getCsvLineDataValue(getAllResults(purchasecontractSearchObj), 'c', checkFlag);

        return csvLineGroup;
    }

    function getAllResults(mySearch){
        var resultSet = mySearch.run();
        var resultArr= [];
        var start = 0;
        var step  = 1000;
        var results = resultSet.getRange({
            start: start,
            end: step
        });
        while(results && results.length>0)
        {
            resultArr = resultArr.concat(results);
            start = Number(start)+Number(step);
            results = resultSet.getRange({
                start: start,
                end: Number(start)+Number(step)
            });
        }
        return resultArr;
    }

    function getCsvLineDataValue(searchData, type, checkFlag){
        var csvFileLine = '';

        if(searchData && searchData.length > 0){
            var checkFlagItemAry = [];
            var dataFlag = '';
            var dataRateorlotpriceFlag = '';
            var dataCurrencyFlag = '';
            var dataFromquantityFlag = '';
            var dataUnitpriceFlag = '';
            var dataOthervendorFlag = '';
            var dataJson = {}
            for (var i = 0; i < searchData.length; i++) {
                if(checkFlag){
                    if(type == 'a'){
                        var dataItem = searchData[i].getValue({
                            name: "itemid",
                            sort: search.Sort.DESC,
                            label: "名前",
                            summary: "GROUP",
                        }) || '';
                        var dataDate = searchData[i].getValue({
                            name: "date",
                            join: "systemNotes",
                            label: "日付",
                            sort: search.Sort.DESC,
                            summary: "GROUP",
                        }) || '';
                        var dataFromquantity = searchData[i].getValue({
                            name: "minimumquantity",
                            join: "pricing",
                            label: "最小数量",
                            summary: "GROUP",
                        }) || '';
                        var dataRateorlotprice = searchData[i].getText({
                            name: "pricelevel",
                            join: "pricing",
                            sort: search.Sort.DESC,
                            label: "価格水準",
                            summary: "GROUP",
                        }) || '';
                        var dataCurrency = searchData[i].getText({
                            name: "currency",
                            join: "pricing",
                            sort: search.Sort.DESC,
                            label: "通貨",
                            summary: "GROUP",
                        }) || '';
                        var dataUnitprice = searchData[i].getValue({
                            name: "unitprice",
                            join: "pricing",
                            label: "単価",
                            summary: "GROUP",
                        }) || '';
                        var dataDisplayname = searchData[i].getValue({
                            name: "displayname",
                            label: "表示名",
                            summary: "GROUP",
                        }) || '';
                        var dataName = dataDisplayname && dataDisplayname != '- None -' ? dataItem + ' ' + dataDisplayname : dataItem + ' ';

                        if(checkFlagItemAry.indexOf(dataName) != -1){
                            if(dataFlag == dataDate){
                                if(dataRateorlotprice != dataRateorlotpriceFlag){
                                    csvFileLine += '"' + dataName + '","' + '販売価格' + '","' + dataDate + '","' + dataRateorlotprice + '","' +''+ '","' + '' + '","' + dataCurrency + '","' + dataFromquantity + '","' + dataUnitprice +'"\r\n';
                                }else{
                                    if(dataCurrency != dataCurrencyFlag){
                                        dataCurrencyFlag = dataCurrency
                                        csvFileLine += '"' + dataName + '","' + '販売価格' + '","' + dataDate + '","' + dataRateorlotprice + '","' +''+ '","' + '' + '","' + dataCurrency + '","' + dataFromquantity + '","' + dataUnitprice +'"\r\n';
                                    }else{
                                        if(dataFromquantity != dataFromquantityFlag){
                                            csvFileLine += '"' + dataName + '","' + '販売価格' + '","' + dataDate + '","' + dataRateorlotprice + '","' +''+ '","' + '' + '","' + dataCurrency + '","' + dataFromquantity + '","' + dataUnitprice +'"\r\n';
                                        }
                                    }
                                }
                            }
                        }else{
                            checkFlagItemAry.push(dataName);
                            dataFlag = dataDate;
                            dataRateorlotpriceFlag = dataRateorlotprice;
                            dataCurrencyFlag = dataCurrency;
                            dataFromquantityFlag = dataFromquantity;
                            csvFileLine += '"' + dataName + '","' + '販売価格' + '","' + dataDate + '","' + dataRateorlotprice + '","' +''+ '","' + '' + '","' + dataCurrency + '","' + dataFromquantity + '","' + dataUnitprice +'"\r\n';
                        }
                    }else if(type == 'b')
                    {
                        var dataItem = searchData[i].getValue({
                            name: "itemid",
                            sort: search.Sort.DESC,
                            label: "名前",
                            summary: "GROUP"
                        }) || '';
                        var dataDate = searchData[i].getValue({
                            name: "date",
                            join: "systemNotes",
                            label: "日付",
                            sort: search.Sort.DESC,
                            summary: "GROUP"
                        }) || '';
                        var dataOthervendor = searchData[i].getText({name: "othervendor", label: "仕入先", summary: "GROUP", sort: search.Sort.DESC}) || '';
                        var dataCurrency = searchData[i].getText({name: "vendorpricecurrency", label: "仕入先価格通貨", summary: "MAX"}) || '';
                        // var dataCurrency = '';
                        var dataUnitprice = searchData[i].getValue({name: "vendorcost", label: "仕入先価格", summary: "GROUP"}) || '';
                        var dataDisplayname = searchData[i].getValue({name: "displayname", label: "表示名", summary: "GROUP"}) || '';
                        var dataName = dataDisplayname && dataDisplayname != '- None -' ? dataItem + ' ' + dataDisplayname : dataItem + ' ';
                        if(checkFlagItemAry.indexOf(dataName) != -1){
                            if(dataFlag == dataDate){
                                if(dataOthervendorFlag != dataOthervendor){
                                    csvFileLine += '"' + dataName + '","' + '購買価格' + '","' + dataDate + '","' + '' + '","' + dataOthervendor + '","' + '' + '","' + dataCurrency + '","' + '' + '","' + dataUnitprice +'"\r\n';
                                    dataOthervendorFlag = dataOthervendor;
//								}else{
//									if(dataUnitpriceFlag != dataUnitprice){
//										csvFileLine += '"' + dataName + '","' + '購買価格' + '","' + dataDate + '","' + '' + '","' + dataOthervendor + '","' + '' + '","' + dataCurrency + '","' + '' + '","' + dataUnitprice +'"\r\n';
//									}
                                }
                            }
                        }else{
                            checkFlagItemAry.push(dataName);
                            dataFlag = dataDate;
                            dataOthervendorFlag = dataOthervendor;
                            dataUnitpriceFlag = dataUnitprice
                            csvFileLine += '"' + dataName + '","' + '購買価格' + '","' + dataDate + '","' + '' + '","' + dataOthervendor + '","' + '' + '","' + dataCurrency + '","' + '' + '","' + dataUnitprice +'"\r\n';
                        }
                    }else{
                        var dataTranid = searchData[i].getValue({name: "tranid", label: "ドキュメント番号"}) || '';
                        var dataFromquantity = searchData[i].getValue({name: "fromquantity",　join: "itemPricing",　label: "数量から"}) || '';
                        var dataRateorlotprice = searchData[i].getValue({name: "rateorlotprice", join: "itemPricing", label: "単価またはロット価格"}) || '';
                        var dataItem = searchData[i].getText({name: "item", label: "アイテム"}) || '';
                        var dataDate = searchData[i].getValue({name: "date", join: "lineSystemNotes", sort: search.Sort.DESC, label: "日付"}) || '';
                        var dataEntity = searchData[i].getText({name: "entity", label: "名前"}) || '';
                        var dataCurrency = searchData[i].getText({name: "currency", label: "通貨"}) || '';
                        var dataDisplayname = searchData[i].getValue({name: "displayname",　join: "item",　label: "表示名"}) || '';
                        var dataName = dataItem + ' ' + dataDisplayname;
                        var  key  = dataFromquantity+"_"+dataRateorlotprice;
                        dataJson[dataTranid] = dataJson[dataTranid]||{};
                        if (!dataJson[dataTranid].hasOwnProperty(key)){
                            dataJson[dataTranid][key] =dataJson[dataTranid][key]||{};
                            csvFileLine += '"' + dataName + '","' + '購入契約' + '","' + dataDate + '","' + '' + '","' + dataEntity + '","' + dataTranid + '","' + dataCurrency + '","' + dataFromquantity + '","' + dataRateorlotprice +'"\r\n';
                        }
                    }
                }else{
                    if(type == 'a'){
                        var dataItem = searchData[i].getValue({name: "itemid", label: "名前"}) || '';
                        var dataDate = searchData[i].getValue({name: "date", join: "systemNotes", sort: search.Sort.DESC, label: "日付"}) || '';
                        var dataFromquantity = searchData[i].getValue({name: "minimumquantity", join: "pricing", label: "最小数量"}) || '';
                        var dataRateorlotprice = searchData[i].getText({name: "pricelevel", join: "pricing", label: "価格水準"}) || '';
                        var dataCurrency = searchData[i].getText({name: "currency", join: "pricing", sort: search.Sort.DESC, label: "通貨"}) || '';
                        var dataUnitprice = searchData[i].getValue({name: "unitprice", join: "pricing", label: "単価"}) || '';
                        var dataDisplayname = searchData[i].getValue({name: "displayname", label: "表示名"}) || '';
                        var dataName = dataItem + ' ' + dataDisplayname;
                        csvFileLine += '"' + dataName + '","' + '販売価格' + '","' + dataDate + '","' + dataRateorlotprice + '","' +''+ '","' + '' + '","' + dataCurrency + '","' + dataFromquantity + '","' + dataUnitprice +'"\r\n';
                    }else if(type == 'b'){
                        var dataItem = searchData[i].getValue({name: "itemid", sort: search.Sort.DESC, label: "名前" }) || '';
                        var dataDate = searchData[i].getValue({
                            name: "date",
                            join: "systemNotes",
                            sort: search.Sort.DESC,
                            label: "日付"
                        }) || '';
                        var dataOthervendor = searchData[i].getText({name: "othervendor", label: "仕入先"}) || '';
                        var dataCurrency = searchData[i].getValue({name: "vendorpricecurrency", label: "仕入先価格通貨"}) || '';
                        var dataUnitprice = searchData[i].getValue({name: "vendorcost", label: "仕入先価格"}) || '';
                        var dataDisplayname = searchData[i].getValue({name: "displayname", label: "表示名"}) || '';
                        var dataName = dataItem + ' ' + dataDisplayname;
                        csvFileLine += '"' + dataName + '","' + '購買価格' + '","' + dataDate + '","' + '' + '","' + dataOthervendor + '","' + '' + '","' + dataCurrency + '","' + '' + '","' + dataUnitprice +'"\r\n';
                    }else{
                        var dataTranid = searchData[i].getValue({name: "tranid", label: "ドキュメント番号"}) || '';

                        var dataFromquantity = searchData[i].getValue({name: "fromquantity",　join: "itemPricing",　label: "数量から"}) || '';
                        var dataRateorlotprice = searchData[i].getValue({name: "rateorlotprice", join: "itemPricing", label: "単価またはロット価格"}) || '';

                        var dataItem = searchData[i].getText({name: "item", label: "アイテム"}) || '';
                        var dataDate = searchData[i].getValue({name: "date", join: "lineSystemNotes", sort: search.Sort.DESC, label: "日付"}) || '';
                        var dataEntity = searchData[i].getText({name: "entity", label: "名前"}) || '';
                        var dataCurrency = searchData[i].getText({name: "currency", label: "通貨"}) || '';
                        var dataDisplayname = searchData[i].getValue({name: "displayname",　join: "item",　label: "表示名"}) || '';
                        var dataName = dataItem + ' ' + dataDisplayname;

                        var  key  = dataFromquantity+"_"+dataRateorlotprice+"_"+dataDate;

                        dataJson[dataTranid] = dataJson[dataTranid]||{};
                        if (!dataJson[dataTranid].hasOwnProperty(key)){
                            dataJson[dataTranid][key] =dataJson[dataTranid][key]||{};
                            csvFileLine += '"' + dataName + '","' + '購入契約' + '","' + dataDate + '","' + '' + '","' + dataEntity + '","' + dataTranid + '","' + dataCurrency + '","' + dataFromquantity + '","' + dataRateorlotprice +'"\r\n';
                        }
                    }
                }
            }
        }
        return csvFileLine;
    }

    function getNewSearchData(body_date_to, body_date_from, item, vendor, purchasecontract,latest_price){
        var checkFlag = true;
        var csvLineGroup = '';

        // 購買価格
        var purchasingPriceFlag = false;
        // 販売価格
        var sellingPriceFlag = false;

        if(!purchasecontract){
            purchasingPriceFlag = true;
            if(!vendor){
                sellingPriceFlag = true;
            }
        }

        if(sellingPriceFlag){
            // 販売価格?索
            var itemSearchObj = search.create({
                type: "inventoryitem",
                filters:
                    [
                        ["type","anyof","InvtPart"],
                        "AND",
                        ["isinactive","is","F"],
                        "AND",
                        ["systemnotes.field","anyof","INVTITEM.RUNITPRICE"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "date",
                            join: "systemNotes",
                            label: "日付",
                            sort: search.Sort.DESC,
                            summary: "GROUP",
                        }),
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.DESC,
                            label: "名前",
                            summary: "GROUP",
                        }),
                        search.createColumn({
                            name: "currency",
                            join: "pricing",
                            sort: search.Sort.DESC,
                            label: "通貨",
                            summary: "GROUP",
                        }),
                        search.createColumn({
                            name: "minimumquantity",
                            join: "pricing",
                            label: "最小数量",
                            summary: "GROUP",
                        }),
                        search.createColumn({
                            name: "maximumquantity",
                            join: "pricing",
                            label: "最大数量",
                            summary: "GROUP",
                        }),
                        search.createColumn({
                            name: "pricelevel",
                            join: "pricing",
                            sort: search.Sort.DESC,
                            label: "価格水準",
                            summary: "GROUP",
                        }),
                        search.createColumn({
                            name: "unitprice",
                            join: "pricing",
                            label: "単価",
                            summary: "GROUP",
                        }),
                        search.createColumn({
                            name: "displayname",
                            label: "表示名",
                            summary: "GROUP",
                        })
                    ]
            });

            if(body_date_from && body_date_to){
                search.createFilter({
                    name : 'date',
                    join : 'systemnotes',
                    operator : 'onorbefore',
                    values : format.format({value : body_date_from, type : format.Type.DATE})
                });
                search.createFilter({
                    name : 'date',
                    join : 'systemnotes',
                    operator : 'onorafter',
                    values : format.format({value : body_date_to, type : format.Type.DATE})
                })
            }

            if(item){
                itemSearchObj.filters.push(
                    search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.ANYOF,
                        values: item
                    })
                );
            }
            csvLineGroup += getCsvLineDataValue(getAllResults(itemSearchObj), 'a', checkFlag);
        }

        if(purchasingPriceFlag){
            var vendorSearchObj = search.create({
                type: "inventoryitem",
                filters:
                    [
                        ["type","anyof","InvtPart"],
                        "AND",
                        ["isinactive","is","F"],
                        "AND",
                        ["systemnotes.field","anyof","INVTITEM.PRICELIST"]
                    ],
                columns:
                    [
                        search.createColumn({name: "vendorcost", label: "仕入先価格", summary: "GROUP"}),
                        search.createColumn({name: "cost", label: "購入価格", summary: "GROUP"}),
                        search.createColumn({name: "othervendor", label: "仕入先", summary: "GROUP", sort: search.Sort.DESC}),
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.DESC,
                            label: "名前",
                            summary: "GROUP"
                        }),
                        search.createColumn({
                            name: "date",
                            join: "systemNotes",
                            label: "日付",
                            sort: search.Sort.DESC,
                            summary: "GROUP"
                        }),
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.DESC,
                            label: "名前",
                            summary: "GROUP"
                        }),
                        search.createColumn({name: "vendorpricecurrency", label: "仕入先価格通貨", sort: search.Sort.DESC, summary: "MAX"}),
                        search.createColumn({name: "displayname", label: "表示名", summary: "GROUP"})
                    ]
            });

            if(body_date_from && body_date_to){
                search.createFilter({
                    name : 'date',
                    join : 'systemnotes',
                    operator : 'onorbefore',
                    values : format.format({value : body_date_from, type : format.Type.DATE})
                });
                search.createFilter({
                    name : 'date',
                    join : 'systemnotes',
                    operator : 'onorafter',
                    values : format.format({value : body_date_to, type : format.Type.DATE})
                })
            }

            if(item){
                vendorSearchObj.filters.push(
                    search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.ANYOF,
                        values: item
                    })
                );
            }

            if(vendor){
                vendorSearchObj.filters.push(
                    search.createFilter({
                        name: 'othervendor',
                        operator: search.Operator.ANYOF,
                        values: vendor
                    })
                );
            }
            csvLineGroup += getCsvLineDataValue(getAllResults(vendorSearchObj), 'b', checkFlag);
        }

        var purchasecontractSearchObj = search.create({
            type: "purchasecontract",
            filters:
                [
                    ["type","anyof","PurchCon"],
                    "AND",
                    ["mainline","is","F"],
                    "AND",
                    ["voided","is","F"],
                    "AND",
                    ["linesystemnotes.field","anyof","CUSTCOL_OGW_RATE_COUNT"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "date",
                        join: "lineSystemNotes",
                        sort: search.Sort.DESC,
                        label: "日付",
                        summary: "GROUP"
                    }),
                    search.createColumn({
                        name: "fromquantity",
                        join: "itemPricing",
                        label: "数量から",
                        summary: "GROUP",
                        sort: search.Sort.DESC
                    }),
                    search.createColumn({
                        name: "rateorlotprice",
                        join: "itemPricing",
                        label: "単価またはロット価格",
                        summary: "GROUP"
                    }),
                    search.createColumn({
                        name: "newvalue",
                        join: "lineSystemNotes",
                        label: "変更後",
                        summary: "GROUP"
                    }),
                    search.createColumn({
                        name: "field",
                        join: "lineSystemNotes",
                        label: "フィールド",
                        summary: "GROUP"
                    }),
                    search.createColumn({name: "item", label: "アイテム", summary: "GROUP", sort: search.Sort.DESC}),
                    search.createColumn({name: "entity", label: "名前", summary: "GROUP", sort: search.Sort.DESC}),
                    search.createColumn({name: "tranid", label: "ドキュメント番号", summary: "GROUP", sort: search.Sort.DESC}),
                    search.createColumn({name: "currency", label: "通貨", summary: "GROUP", sort: search.Sort.DESC}),
                    search.createColumn({
                        name: "displayname",
                        join: "item",
                        label: "表示名",
                        summary: "GROUP"
                    })
                ]
        });

        if(body_date_from && body_date_to){
            search.createFilter({
                name : 'date',
                join : 'linesystemnotes',
                operator : 'onorbefore',
                values : format.format({value : body_date_from, type : format.Type.DATE})
            });
            search.createFilter({
                name : 'date',
                join : 'linesystemnotes',
                operator : 'onorafter',
                values : format.format({value : body_date_to, type : format.Type.DATE})
            })
        }

        if(item){
            purchasecontractSearchObj.filters.push(
                search.createFilter({
                    name: 'item',
                    operator: search.Operator.ANYOF,
                    values: item
                })
            );
        }

        if(vendor){
            purchasecontractSearchObj.filters.push(
                search.createFilter({
                    name : 'internalid',
                    join : 'vendor',
                    operator: search.Operator.ANYOF,
                    values : vendor
                })
            );
        }

        if(purchasecontract){
            purchasecontractSearchObj.filters.push(
                search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.ANYOF,
                    values: purchasecontract
                })
            );
        }
        csvLineGroup += getCsvLineDataValue(getAllResults(purchasecontractSearchObj), 'c', checkFlag);

        return csvLineGroup;

    }



    function cancel(){

        formRecord.setValue({fieldId: 'custpage_body_date_from', value: ''});
        formRecord.setValue({fieldId: 'custpage_body_date_to', value: ''});
        formRecord.setValue({fieldId: 'custpage_body_item', value: ''});
        formRecord.setValue({fieldId: 'custpage_body_vendor', value: ''});
        formRecord.setValue({fieldId: 'custpage_body_purchasecontract', value: ''});
        formRecord.setValue({fieldId: 'custpage_body_latest_price', value: false});

    }

    return {
        pageInit : pageInit,
        fieldChanged : fieldChanged,
        csvExport : csvExport,
        cancel : cancel
    };
});
