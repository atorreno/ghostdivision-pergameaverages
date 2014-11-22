// ==UserScript==
// @name           Per game averages
// @namespace      http://www.lillex.com/
// @description calculates per game averages
// @include http://games.espn.go.com/fba/standings?leagueId=34796&seasonId=2015
// @include http://games.espn.go.com/fba/standings?leagueId=34796&view=live
// @include http://games.espn.go.com/fba/standings?leagueId=34796&view=official
// @grant none
// ==/UserScript==
// a function that loads jQuery and calls a callback function when jQuery has finished loading
function addJQuery(callback) {
  var script = document.createElement("script"),
  tablesorter = document.createElement("script");
  script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js");
  tablesorter.setAttribute("src", "//lillex.com/fantasy/jquery.tablesorter.min.js");
  script.addEventListener('load', function() {
    document.body.appendChild(tablesorter);
  }, false);
  tablesorter.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}







// the guts of this userscript
function main() {
  var $j = jQuery.noConflict();

  //helper functions
  var calculateAvg = function(el,total,gamesplayed){
    el.html(Math.round(parseInt(total)/parseInt(gamesplayed) *1000)/1000)
  }


  var rankValues = function (columnId) {
    var statvalues = [];
    var i = 0;

    $j("#futureranktable " + columnId).each(function(){
      statvalues[i] = [$j(this).html(), i];
      i++;
    });

    statvalues.sort(function(a,b) { return a[0] - b[0]; } );

    for (var j = 0; j < statvalues.length; j++) {
      statvalues[j][0] = j +1;            
    }

    statvalues.reverse();

    var teamValues = [];
    for (var j = 0; j < 10; j++) {        
      teamValues[j] = new Array();
    }    

    var col = 0;
    var j = 0;
    $j("#futureranktable .sortableGP").each(function(){   
      var total = 0;
      for (var k = 0; k < teamValues[j].length; k++) {            
        total += teamValues[j][k];            
      }               
      $j(this).html(total);        
      j++;
    });


    i = 0;
    $j("#futureranktable " + columnId).each(function(){            
      for (var j = 0; j < statvalues.length; j++) {
        if (statvalues[j][1] == i) {                
          $j(this).html(statvalues[j][0]);
          teamValues[i][col] = statvalues[j][0];
          break;
        }
      }
      i++;
    });

    col++;        
  }



  /*
  parameter 1: new table ID
  parameter 2: new class prefix
  parameter 3: new table header

  */
  var createNewTable = function(newTableID, newClassPrefix, newTableHeader){
    //create a new table
    var statsTable = $j("#statsTable").clone(false).attr("id",newTableID)
    statsTable.prepend("<thead>");
    var headerRows = statsTable.find("tr:lt(3)").remove()
    statsTable.find("thead").append(headerRows);
    statsTable.find("thead tr:nth-child(3) td").replaceWith(function(i, html){
      if (i != 0 && i != 10){
        return '<th>' + html + '</th>';
      } else {
        return '<td class="sectionLeadingSpacer">' + html + '</td>';
      }
    });
    statsTable.find('.hand').each(function(){
      $j(this).attr('onclick', '');
    });
    statsTable.find('.precise').each(function(){
      var classNames = $j(this).attr('class');
      var id = $j(this).attr('id').replace('tmTotalStat','');
      classNames = classNames.replace("precise", newClassPrefix + "-prec");
      classNames = classNames.replace("sortableStat", newClassPrefix + "-sortableSt");
      id = "pga" + id;
      $j(this).attr('class',classNames).attr('id', id);
    });
    statsTable.find('tbody tr').removeClass("tableBody").removeClass("sortableRow").removeClass("evenRow").removeClass("oddRow");
    statsTable.find('.sortableTeamName').removeClass('sortableTeamName');
    statsTable.insertAfter("#statsTable").before("<br>");

    $j("#" + newTableID + " .tableHead").html(newTableHeader);

    return statsTable;

  }





  pgaTable = createNewTable("pergameavgtable", "pga", "PER GAME AVERAGES");
  frTable = createNewTable("futureranktable", "fr", "FUTURE RANK");


  $j("#pergameavgtable .pga-sortableSt17, #pergameavgtable .pga-sortableSt16, #pergameavgtable .pga-sortableSt11,#pergameavgtable .pga-sortableSt6, #pergameavgtable .pga-sortableSt3, #pergameavgtable .pga-sortableSt2, #pergameavgtable .pga-sortableSt1, #pergameavgtable .pga-sortableSt0").each(function(){
    calculateAvg($j(this),$j(this).html(),$j(this).siblings(".sortableGP").html());
  });

  rankValues(".fr-sortableSt22");
  rankValues(".fr-sortableSt20");    
  rankValues(".fr-sortableSt17");
  rankValues(".fr-sortableSt16");
  rankValues(".fr-sortableSt6");
  rankValues(".fr-sortableSt3");
  rankValues(".fr-sortableSt2");
  rankValues(".fr-sortableSt1");
  rankValues(".fr-sortableSt0");


  $j("body").append("<style>.odd{background-color:#F8F8F2 !important} .even{background-color:#F2F2E8 !important}</style>");




    frTable.tablesorter({widgets:['zebra']});
    pgaTable.tablesorter({widgets:['zebra']});
  }



// load jQuery and execute the main function
addJQuery(main);


