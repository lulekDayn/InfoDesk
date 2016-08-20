"use strict";
/**
 * Объект хранящий рузультаты поиска по фирмам
 */
var result = {
    index : 0,
    row : {},
    openModelWindow : false,
    paginate : false,
    firms : false,
    parts : false,
    service : false,
    loading : false,
    toBack : false,
    toNext : true,
};

/**
 * Объект отвечающий за запрос к серверу о поиске фирмы и рендере результата
 */
var searcherFirms = {
    submitForm : false,
    render : function(data) {
        let resultData = `<table class='table table-hover'>
                            <thead>
                                <tr><th style="width:25%;">Название<br>Телефон</th><th style="width:25%;">Адрес<br>Район</th>
                                <th>Профиль деятельсности</th><th style="width:20%;">Режим работы<br>Коментарий</th></tr>
                            </thead>
                          <tbody>`;
        let renderLayout = $("#search-result");

        if(data.message.length > 0){
            data.message.forEach( function (item, i, arr){
                resultData +=  '<tr><td><a href="javascript:void(0);" onclick=\'openFirm('+
                                        JSON.stringify(item) +');\'>'+
                                        item.Name + '</a><br><br>' + item.Phone + '</td><td>' +
                                        item.Address + '<br><br>' + item.District + '</td><td>' +
                                        item.ActivityType + '</td><td><pre>' +
                                        item.OperatingMode + '</pre><br>' + item.Comment + '</td></tr>';
                if(i + 1 == arr.length) {
                    resultData += "</tbody></table>";
                    renderLayout.html(resultData);
                    result.index = 0;
                    result.row = renderLayout.children().children().children();
                    $('#loader').hide();
                }
            });
        } else {
            resultData = "<h3>Нет таких фирм</h3>";
            renderLayout.html(resultData);
            $("#loader").hide();
        }
        $($(renderLayout.siblings()[0]).children()[0]).html("Найдено фирм - " + data.message.length);
        result.firms = true;
        result.parts = false;
        result.service = false;
        result.paginate = false;

    },
    search : function() {
        let str = document.getElementById('search-line').value;
        if(str == '') {
            alert("Введите искомую строку");
            return false;
        }

        $('#loader').show();
        $('#search-result').html('');
        $.ajax({
            method: "GET",
            url: "index.php?r=site%2Fsearch",
            data: {str: str}
        }).done(function(data){
            searcherFirms.render(data);
        });
    },
};

/**
 * Объект отвечающий за работу с фильтром запчастей
 */
var searchParts = {
    idDetail : false,
    idMark   : false,
    idModel  : false,
    idBody   : false,
    idEngine : false,
    idNumber : false,
    idPage      : 1,
    limitResult : 50,
    currentSelect : false,

    // функция вывода результата запроса
    render : function(data) {
        let resultData = `<table class='table table-hover'>
                            <thead>
                                <tr><th>ID Фирмы</th><th>Приоритет</th><th>Наименование</th><th>Марка</th><th>Модель</th>
                                <th>Кузов</th><th>Двигатель</th><th>Год</th><th>Цена</th>
                                <th>Примечание</th><th>Номер</th></tr>
                            </thead>
                          <tbody>`;
        let renderLayout = $("#search-result");

        if(data.message.length > 0){
            result.paginate = data.message.length >= searchParts.limitResult;
            data.message.forEach( function (item, i, arr){
                resultData +=  '<tr><td>' + item.ID_Firm + '</td><td>'+ item.Priority +'</td>' +
                                       '<td><a href="javascript:void(0);" onclick=\'openFirmInPats('+
                                        JSON.stringify(item.ID_Firm) +');\'>'+
                                        item.DetailName + '</a></td><td>' +
                                        item.MarkName + '</td><td>' +
                                        item.ModelName + '</td><td>' +
                                        item.BodyName + '</td><td>' +
                                        item.EngineName + '</td><td>' +
                                        item.CarYear + '</td><td>' +
                                        item.Cost + '</td><td>' +
                                        item.Comment + '</td><td>' +
                                        item.Catalog_Number + '</td></tr>';
                if(i + 1 == arr.length) {
                    resultData += "</tbody></table>";
                    renderLayout.html(resultData);
                    result.index = 0;
                    result.row = renderLayout.children().children().children();
                    $("#loader").hide();
                }
            });
        } else {
            resultData = "<h3>Нет запчастей</h3>";
            renderLayout.html(resultData);
            $("#loader").hide();
        }
        $($(renderLayout.siblings()[0]).children()[0]).html("Найдено запчастей - " + data.message.length +
                                                            " (Старница " + searchParts.idPage + ")");
        result.firms = false;
        result.parts = true;
        result.service = false;
        result.loading = false;

        // если возвращаемся назат то нашинаем с конца списка
        if(result.toBack) {
            result.toBack = false;
            result.index = data.message.length;
            $(result.row[result.index]).addClass("hover");
        }
        if(result.toNext) {
            result.toNext = false;
            result.index = 1;
            $(result.row[result.index]).addClass("hover");
        }
    },

    search : function() {
        result.loading = true;
        $('#loader').show();
        $('#search-result').html('');
        $.ajax({
            method: "GET",
            url: "index.php?r=site%2Fsearch-parts",
            data: {
                detail_id : searchParts.idDetail,
                mark_id   : searchParts.idMark,
                model_id  : searchParts.idModel,
                body_id   : searchParts.idBody,
                engine_id : searchParts.idEngine,
                page      : searchParts.idPage,
                limit     : searchParts.limitResult,
                number    : document.getElementById('number').value,
            }
        }).done(function(data){
            searchParts.render(data);
        });
    },

    getModels : function() {
        $.ajax({
            method: "GET",
            url: "index.php?r=site%2Fget-models",
            data: {id: searchParts.idMark}
        }).done(function(data){
            // рисуем модели
            let list = '<option value="">Модель</option>';
            if(data.message.length > 0){
                data.message.forEach(function (item, i) {
                    list += `<option value="${item.id}">${item.Name}</option>`;
                    if(data.message.length == i+1) {
                        $('#w2').html(list);
                    }
                })
            }
        });
    },

    getBodys : function() {
        $.ajax({
            method: "GET",
            url: "index.php?r=site%2Fget-bodys",
            data: {id: searchParts.idModel}
        }).done(function(data){
            // рисуем кузова
            let list = '<option value="">Кузов</option>';
            if(data.message.length > 0){
                data.message.forEach(function (item, i, arr) {
                    list += `<option value="${item.id}">${item.Name}</option>`;
                    if(data.message.length == i+1) {
                        $('#w3').html(list);
                    }
                })
            }
        });
    },

    getEngine : function() {
        $.ajax({
            method: "GET",
            url: "index.php?r=site%2Fget-engine",
            data: {
                mark_id: searchParts.idMark,
                model_id: searchParts.idModel,
                body_id: searchParts.idBody,
            }
        }).done(function(data){
            // рисуем двигателя
            let list = '<option value="">Двигатель</option>';
            if(data.message.length > 0){
                data.message.forEach(function (item, i) {
                    list += `<option value="${item.id}">${item.Name}</option>`;
                    if(data.message.length == i+1) {
                        $('#w4').html(list);
                    }
                })
            }
        });
    },
};

/**
 * По энтеру в поле запускаем поиск фирм
 */
function runSearch(e) {
    if (e.keyCode == 13) {
        searcherFirms.search();
        $($('#search-line').focus()).select();
        return false;
    }
}

/**
 * Функция обработки хоткеев навигации
 */
function keyNavigate(event) {
    // подгрузка следующей страницы
    if (((event.keyCode == 40 && result.index >= searchParts.limitResult)
        || event.keyCode == 34) &&
        result.paginate &&
        result.parts && !result.loading) {
        searchParts.idPage += 1;
        result.toNext = true;
        searchParts.search();
    }
    // подгрузка предидущей страницы
    if (((event.keyCode == 38 && result.index < 2) || event.keyCode == 33) &&
        result.parts &&
        searchParts.idPage > 1 && !result.loading) {
        searchParts.idPage -= 1;
        result.toBack = true;
        searchParts.search();
    }

    if (event.keyCode == 40 && event.ctrlKey && result.index < result.row.length - 1) {
        //40 низ
        result.index = result.index + 1;
        if (result.parts) {
            $($($(result.row[result.index]).children()[2]).children()[0]).focus();
        } else {
            if(result.openModelWindow) {
                $($($(result.row[result.index]).children()[0]).children()[0]).click();
            } else {
                $($($(result.row[result.index]).children()[0]).children()[0]).focus();
            }
        }
        $(result.row[result.index]).addClass("hover");
        if (result.index > 1)
            $(result.row[result.index - 1]).removeClass("hover");

    } else if (event.keyCode == 38 && event.ctrlKey && result.index > 1) {
        //38 верх
        result.index = result.index - 1;
        if (result.parts) {
            $($($(result.row[result.index]).children()[2]).children()[0]).focus();
        } else {
            if(result.openModelWindow) {
                $($($(result.row[result.index]).children()[0]).children()[0]).click();
            } else {
                $($($(result.row[result.index]).children()[0]).children()[0]).focus();
            }
        }
        $(result.row[result.index]).addClass("hover");
        $(result.row[result.index + 1]).removeClass("hover");

    }

    // в результатах по Esc скролим наверх если не открыто модальное окно
    if (event.keyCode == 27 && result.index > 0) {
        if (!result.openModelWindow) {
            if (result.parts) {
                $(searchParts.currentSelect).select2('open').select2('close');
            }
            if (result.firms) {
                $($('#search-line').focus()).select();
            }
            window.scrollTo(0, 0);
            $(result.row[result.index]).removeClass("hover");
            result.index = 0;
        } else {
            result.openModelWindow = false;
        }
    }

    // для того что бы работол поиск по энетеру в запчастях
    if (event.keyCode != 13) {
        searchParts.submitForm = false;
    }

    // перемещение по фильтрам по Ctrl + left - 37 и Ctrl + Right - 39
    if (event.keyCode == 39 && event.ctrlKey) {
        if (result.firms) {
            $(searchParts.currentSelect).select2('open').select2('close');
            result.parts = true;
            result.firms = false;
        } else if (result.parts) {
            $('#service').focus();
            result.service = true;
            result.parts = false;
        } else if (result.service) {
            $($('#search-line').focus()).select();
            result.firms = true;
            result.service = false;
        }
    }
    if (event.keyCode == 37 && event.ctrlKey) {
        if (result.firms) {
            $('#service').focus();
            result.service = true;
            result.firms = false;
        } else if (result.parts) {
            $($('#search-line').focus()).select();
            result.firms = true;
            result.parts = false;
        } else if (result.service) {
            $(searchParts.currentSelect).select2('open').select2('close');
            result.parts = true;
            result.service = false;
        }
    }
}

/**
 * Функция открытия карточки фирмы в результатах поиска
 * @param data
 */
function openFirm(data) {
    // мапим данные
    $('#firmName').html(data.Name);
    $('#firmOrganizationType').html(data.OrganizationType);
    $('#firmActivityType').html(data.ActivityType);
    $('#firmDistrict').html(data.District);
    $('#firmAddress').html(data.Address);
    $('#firmPhone').html(data.Phone);
    $('#firmFax').html(data.Fax);
    $('#firmEmail').html(data.Email);
    $('#firmURL').html(data.URL);
    $('#firmOperatingMode').html(data.OperatingMode);
    $('#firmComment').html(data.Comment);

    // открываем окно
    $('#modalFirm').draggable({
        handle: ".modal-dialog"
    }).modal({backdrop : false});

    $($($(result.row[result.index]).children()[0]).children()[0]).focus();
    result.openModelWindow = true;
}

function openFirmInPats(id) {
    $.ajax({
        method: "GET",
        url: "index.php?r=site%2Fget-firm",
        data: {
            firm_id : id,
        }
    }).done(function(data){
        $('#partsName').html(data.message[0].Name);
        $('#partsDistrict').html(data.message[0].District);
        $('#partsAddress').html(data.message[0].Address);
        $('#partsPhone').html(data.message[0].Phone);
        $('#partsOperatingMode').html(data.message[0].OperatingMode);

        $('#modalParts').draggable({
            handle: ".modal-dialog"
        }).modal({backdrop : false});

        $($($(result.row[result.index]).children()[2]).children()[0]).focus();
        result.openModelWindow = true;
    });
}

var serviceSearch = {
    input: $('#service'),
    groupList: $('#service')[0].innerHTML,
    lastGroupId: $('#service')[0][0].value,
    gridCreate: false,
    inCategory: false,
    open: function (event) {
        if (event.keyCode == 13 && (!this.inCategory)) {
            this.openCategory();
            this.inCategory = true;
            return false;
        } else if (event.keyCode == 13 && this.inCategory) {
            this.searchService();
            return false;
        }
        if (event.keyCode == 27 && this.inCategory) {
            this.renderGroups();
            this.inCategory = false;
            this.input[0].value = this.lastGroupId;
            return false;
        }
    },
    openCategory: function () {
        this.lastGroupId = this.input[0].value;
        $.ajax({
            method: "GET",
            url: "index.php?r=site%2Fget-service-group",
            data: {id: this.input[0].value}
        }).done(function (data) {
            serviceSearch.input.html(data.message);
            serviceSearch.input[0].value = serviceSearch.input[0][0].value;
        });

    },
    searchService: function () {
        $('#modalResult').modal({backdrop: false});
        let grid = $("#result-search");
        // настраиваем грид для результатов
        // делаем это здесь что бы ширина соотвествала экрану
        if (!this.gridCreate) {
            grid.jqGrid({
                colModel: [
                    {label: 'Row', name: 'Row', key: true, width: 20},
                    {label: 'ID_Firm', name: 'ID_Firm', width: 25},
                    {label: 'Comment', name: 'Comment', width: 150},
                    {label: 'CarList', name: 'CarList', width: 150},
                    {label: 'District', name: 'District', width: 150},
                    {label: 'Coast', name: 'Coast', width: 150}
                ],
                viewrecords: true, // show the current page, data rang and total records on the toolbar
                autowidth: true,
                height: $('#modalResult').height() - 200,
                rowNum: 5000,
                datatype: 'local',
                pager: "#jqGridPager",
                styleUI: 'Bootstrap',
                responsive: true,
                cmTemplate: {sortable: false,},

            });

            grid.jqGrid('bindKeys', {
                "onEnter": function (id) {
                    openFirmInPats(grid.getCell(id, 'ID_Firm'));
                }
            });
            this.gridCreate = true; // для того что бы делать это единожды
        }

        grid.jqGrid("clearGridData");
        grid[0].grid.beginReq();
        $.ajax({
            method: "GET",
            url: "index.php?r=site%2Fservice-search",
            data: {id: this.input[0].value}
        }).done(function (data) {
            grid.jqGrid('setGridParam', {data: data.rows});
            // hide the show message
            grid[0].grid.endReq();
            // refresh the grid
            grid.trigger('reloadGrid');
            grid.setSelection(1, true);
            grid.focus();
        });
    },
    renderGroups: function () {
        this.input.html(this.groupList);
    },
};


function ready() {
    // Инициализация
    $($('#search-line').focus()).select();
    result.firms = true;
    result.parts = false;
    result.service = false;
    searchParts.currentSelect = $('#w0');

    $('#modalFirm').on('hidden.bs.modal', function () {
        $($($(result.row[result.index]).children()[0]).children()[0]).focus();
    });

    $('#modalParts').on('hidden.bs.modal', function () {
        if(result.service) {
            $("#result-search").focus();
        } else if (result.parts) {
            $($($(result.row[result.index]).children()[2]).children()[0]).focus();
        }
    });

    $('#modalResult').on('hidden.bs.modal', function () {
        if(result.service) {
            $('#service').focus();
        }
    });
}

document.addEventListener("DOMContentLoaded", ready);

