var THEAD = "<thead><tr>\
  <th>拥有</th>\
  <th>名称</th>\
  <th>类别</th>\
  <th>编号</th>\
  <th>简约</th>\
  <th>华丽</th>\
  <th>可爱</th>\
  <th>成熟</th>\
  <th>活泼</th>\
  <th>优雅</th>\
  <th>清纯</th>\
  <th>性感</th>\
  <th>清凉</th>\
  <th>保暖</th>\
  <th>特殊属性</th>\
  </tr></thead>";
  
var THEAD_SCORE = "<thead><tr>\
  <th>拥有</th>\
  <th>分数</th>\
  <th>名称</th>\
  <th>类别</th>\
  <th>编号</th>\
  <th>简约</th>\
  <th>华丽</th>\
  <th>可爱</th>\
  <th>成熟</th>\
  <th>活泼</th>\
  <th>优雅</th>\
  <th>清纯</th>\
  <th>性感</th>\
  <th>清凉</th>\
  <th>保暖</th>\
  <th>特殊属性</th>\
  </tr></thead>";

var FEATURES = ["simple", "cute", "active", "pure", "cool"];

// for table use
function table(tdata) {
  return "<table>" + tdata + "</table>";
}

function tr(tds) {
  return "<tr>" + tds + "</tr>";
}

function td(data, cls) {
  return "<td class='" + cls + "'>" + data + "</td>";
}

function inventoryCheckbox(id, own) {
  var ret = "<input type = 'checkbox' name = 'inventory' id = '" + id
      + "' onClick='toggleInventory(\"" + id + "\")'";
  if (own) {
    ret += "checked";
  }
  ret += "/>";
  return ret;
}

function toggleInventory(id) {
  var checked = document.getElementById(id).checked;
  clothesSet[id].own = checked;
  saveAndUpdate();
}

function row(piece) {
  var ret = td(inventoryCheckbox(piece.name, piece.own), "");
  if (!isFilteringMode) {
    ret += td(piece.tmpScore);
  }
  var csv = piece.toCsv();
  for (var i in csv) {
    ret += td(csv[i], getStyle(csv[i]));
  }
  return tr(ret);
}

function getStyle(rating) {
  switch (rating) {
    case "SS": return 'S';
    case "S": return 'S';
    case "A": return 'A';
    case "B": return 'B';
    case "C": return 'C';
    default: return ""
  }
}

function list(rows) {
  ret = isFilteringMode ? THEAD : THEAD_SCORE;
  for (var i in rows) {
    ret += row(rows[i]);
  }
  return table(ret);
}

function drawTable(data, div) {
  container = document.getElementById(div);
  container.innerHTML = list(data);
}

function refreshTable() {
  var filters = {};
  for (var i in FEATURES) {
    var f = FEATURES[i];
    var weight = parseFloat(document.getElementById(f + "Weight").value);
    if (!weight) {
      weight = 1;
    }
    for (var j in document.filter_form[f]) {
      var element = document.filter_form[f][j];
      if (element.type == "radio" && element.checked) {
        filters[element.name] = parseInt(element.value) * weight;
      }
    }
  }
  for (var i in document.filter_form.inventory) {
    var element = document.filter_form.inventory[i];
    if (element.checked) {
      filters[element.value] = true;
    }
  }
  for (var i in document.filter_form.category) {
    var element = document.filter_form.category[i];
    if (element.checked) {
      filters[element.value] = true;
    }
  }
  drawTable(filtering(filters), "clothes");
}

function byScore(a, b) {
  var cata = category.indexOf(a.type);
  var catb = category.indexOf(b.type);
  return (cata - catb == 0) ? b.tmpScore - a.tmpScore : cata - catb;
}

function filtering(filters) {
  var result = [];
  for (var i in clothes) {
    if (matches(clothes[i], filters)) {
      if (!isFilteringMode) {
        clothes[i].calc(filters);
      }
      result.push(clothes[i]);
    }
  }
  if (!isFilteringMode) {
    result.sort(byScore);
  }
  return result;
}

function matches(c, filters) {
  // only filter by feature when filtering
  if (isFilteringMode) {
    for (var i in FEATURES) {
      var f = FEATURES[i];
      if (filters[f] && filters[f] * c[f][2] < 0) {
        return false;
      }
    }
  } 
  return ((c.own && filters.own) || (!c.own && filters.missing)) && filters[c.type];
}

function loadCustomInventory() {
  var myClothes = document.getElementById("myClothes").value;
  if (myClothes.indexOf('|') > 0) {
    loadNew(myClothes);
  } else {
    load(myClothes);
  } 
  saveAndUpdate();
  refreshTable();
}

function selectAllCategories() {
  var all = document.getElementById('allCategory');
  for (var i in document.filter_form.category) {
    var element = document.filter_form.category[i];
    element.checked = all.checked;
  }
  refreshTable();
}

function drawFilter() {
  cate = document.getElementById("category_div");
  out = "<input type='checkbox' id='allCategory' onClick='selectAllCategories()' checked /> 全选<br/>\n";
  for (var i in category) {
    out += "<input type='checkbox' name='category' value='" + category[i]
        + "'' onClick='refreshTable()' checked />" + category[i] + "\n";
  }
  cate.innerHTML = out;
}

var isFilteringMode = true;
function changeMode(isFiltering) {
  for (var i in FEATURES) {
    var f = FEATURES[i];
    document.getElementById(f + "Weight").disabled = isFiltering;
  }
  document.getElementById("theme").disabled = isFiltering;
  isFilteringMode = isFiltering;
  refreshTable();
}

function changeFilter() {
  var dropdown = document.getElementById("theme");
  dropdown.options[0].selected = true;
  refreshTable();
}

function changeTheme() {
  var dropdown = document.getElementById("theme");
  for (var i in dropdown.options) {
    if (dropdown.options[i].selected) {
      var theme = dropdown.options[i].value;
      if (allThemes[theme]) {
        setFilters(allThemes[theme]);
        break;
      }
    }
  }
}

function setFilters(filters) {
  for (var i in FEATURES) {
    var f = FEATURES[i];
    var weight = filters[f];
    document.getElementById(f + "Weight").value = Math.abs(weight);
    for (var j in document.filter_form[f]) {
      var element = document.filter_form[f][j];
      if (parseInt(element.value) * weight > 0) {
        element.checked = true;
        break;
      }
    }
  }
  refreshTable();
}

function drawTheme() {
  var dropdown = document.getElementById("theme");
  var def = document.createElement('option');
  def.text = '自定义关卡';
  def.value = 'custom' 
  dropdown.add(def);
  for (var theme in allThemes) {
    var option = document.createElement('option');
    option.text = theme;
    option.value = theme;
    dropdown.add(option);
  }
}

function drawImport() {
  var dropdown = document.getElementById("importCate");
  var def = document.createElement('option');
  def.text = '请选择类别';
  def.value = '';
  dropdown.add(def);
  for (var cate in scoring) {
    var option = document.createElement('option');
    option.text = cate;
    option.value = cate;
    dropdown.add(option);
  }
}

function clearImport() {
  document.getElementById("importData").value = "";
}

function saveAndUpdate() {
  var mine = save();
  document.getElementById("inventoryCount").innerHTML = '(' + mine.size + ')';
  document.getElementById("myClothes").value = mine.serialize();
}

function doImport() {
  var dropdown = document.getElementById("importCate");
  var type = dropdown.options[dropdown.selectedIndex].value;
  var raw = document.getElementById("importData").value;
  var data = raw.match(/\d+/g);
  var mapping = {}
  for (var i in data) {
    mapping[data[i]] = true;
  }
  var updating = [];
  for (var i in clothes) {
    if (clothes[i].getType() == type && mapping[clothes[i].id]) {
      updating.push(clothes[i].name);
    }
  }
  var names = updating.join(",");
  if (confirm("你将要在>>" + type + "<<中导入：\n" + names)) {
    var myClothes = MyClothes();
    myClothes.filter(clothes);
    if (myClothes.mine[type]) {
      myClothes.mine[type] = myClothes.mine[type].concat(data);
    } else {
      myClothes.mine[type] = data;
    }
    myClothes.update(clothes);
    saveAndUpdate();
    refreshTable();
    clearImport();
  }
}

function init() {
  var mine = loadFromStorage();
  document.getElementById("inventoryCount").innerHTML = '(' + mine.size + ')';
  document.getElementById("myClothes").value = mine.serialize();
  drawFilter();
  drawTheme();
  drawImport();
  changeMode(true);
}
