const START_PAGE = "Pink%20Floyd";
const ITERATIONS = 1;

const URL_BEGIN = "https://en.wikipedia.org/w/api.php?action=query&titles=";
const URL_END = "&prop=revisions&rvprop=content&format=json&redirects=1";

var visitedPages = [];

var links;

$(document).ready(function ()
{
  //var pageLink
  //pageLinks[START_PAGE] = {};
  //Get initial pages
  links = getLinks(START_PAGE, 0, console.log);
});

function getLinks(currentPage, level, callback)
{
  visitedPages.push(currentPage)
  var pageLinks = {}
  var data = $.getJSON(URL_BEGIN + currentPage + URL_END, function(data)
  {
    var counter = 0;

    var pages = data.query.pages;
    for(var page in pages)
    {
      pageContentObj = pages[page].revisions[0];
      for(var key in pageContentObj) if(pageContentObj[key].length > 100)
      {
        counter++;

        var pageContent = pageContentObj[key];
        //Get links
        hyperlinks = getFromBetween.get(pageContent,"[[","]]");
        for(var link in hyperlinks)
        {
          link = hyperlinks[link].split("|")[0]; //Remove friendly name
          link = link.replaceAll(" ", "%20");

          //Add to pagelist object
          prefix = link.split(":")[0];
          if(prefix != "Category" && prefix != "File" && prefix != "Wikipedia")
          {
            if(level < ITERATIONS && !visitedPages.includes(arguments, link))
            {
              console.log(level + ": " + link)
              //counter++;
              pageLinks[link] = getLinks(link, level+1, function(res)
              {
                for(var k in res) pageLinks[k]=res[k];
                counter--;
                if(counter == 0 && callback) callback(pageLinks);
              });
            }
          }
        }
      }
    }
  });
  return pageLinks;
}

var getFromBetween = {
    results:[],
    string:"",
    getFromBetween:function (sub1,sub2) {
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var SP = this.string.indexOf(sub1)+sub1.length;
        var string1 = this.string.substr(0,SP);
        var string2 = this.string.substr(SP);
        var TP = string1.length + string2.indexOf(sub2);
        return this.string.substring(SP,TP);
    },
    removeFromBetween:function (sub1,sub2) {
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var removal = sub1+this.getFromBetween(sub1,sub2)+sub2;
        this.string = this.string.replace(removal,"");
    },
    getAllResults:function (sub1,sub2) {
        // first check to see if we do have both substrings
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;

        // find one result
        var result = this.getFromBetween(sub1,sub2);
        // push it to the results array
        this.results.push(result);
        // remove the most recently found one from the string
        this.removeFromBetween(sub1,sub2);

        // if there's more substrings
        if(this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
            this.getAllResults(sub1,sub2);
        }
        else return;
    },
    get:function (string,sub1,sub2) {
        this.results = [];
        this.string = string;
        this.getAllResults(sub1,sub2);
        return this.results;
    }
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
