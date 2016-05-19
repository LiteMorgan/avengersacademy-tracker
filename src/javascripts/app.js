const underscore = require('underscore');
global._ = underscore

// getJSON Function
function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

function getJSON(url) {
  return get(url).then(JSON.parse);
}

getJSON('/global.json').then(function(data){
  // get JSON data
  return data;
}).catch(function(error){
  $('.error').show();
}).then(function(data){
  // Take JSON data.characters and build Character Tracker
  $.each($(data), function(i, data){
    $.each($(data.characters), function(i, char){
      trackerBuild(char, characterTracker);
    });
    // Take JSON data.costumes and build Costumes Tracker
    $.each($(data.costumes), function(i, cost){
      trackerBuild(cost, costumeTracker);
    });
    // Take JSON data.buildings and build Buildings Tracker
    $.each($(data.buildings), function(i, build){
      trackerBuild(build, buildingTracker);
    });
    // Take JSON data.challenges and build Buildings Tracker
    $.each($(data.challenges), function(i, chal){
      trackerBuild(chal, challengeTracker);
    });
    // Take JSON data.special and build Special Tracker
    $.each($(data.special), function(i, spec){
      trackerBuild(spec, specialTracker);
    });
  });
  return data;
}).then(function(data){
  // Function to take all items
  // Add to an array
  // Sort
  // And then return combined totals
  itemCards(data, function(){
    itemTotals();
  });
}).then(function(){
  if (!localStorage['aaCivilWar']) {
    localStorage['aaCivilWar'] = JSON.stringify({});
  } else {
    var stored = JSON.parse(localStorage.aaCivilWar),
        storedLength = Object.keys(stored).length;

    for (var i = 0; i < storedLength; i++) {
      var key = Object.keys(stored)[i];
      if(stored[key].status){
        var check = $('#trackerApp').find('#' + key);
        check.prop('checked', true);
      }
    }
  }

  if (!localStorage['aaSettings']) {
    localStorage['aaSettings'] = JSON.stringify({});
  } else {
    var stored = JSON.parse(localStorage.aaSettings);
    if($.isEmptyObject(stored)) {
      return;
    } else if(stored['premiumContentHide'].status) {
      $('input#premiumToggle').prop('checked', true);
      $('.table--premium').toggleClass('table--hidden');
    }
  }
}).then(function(){
  finishedItems();
  itemTotals();
  zeroItems();
  settingsMenu();
  premiumToggle();
});

// Build Tracker
function trackerBuild(data, location){
  $(location).append(trackerHTML(data.name, data.frag, data.mats, data.premium));
};

function trackerHTML(name, frag, items, premium){
  var i = 0,
      line,
      isPremium = '',
      itemArray = [],
      itemList = $.each($(items), function(i, mats){
                   itemArray += '<li><span class="item__req" data-item="' +
                                mats.frag +
                                '">' +
                                mats.req +
                                '</span>' +
                                mats.item +
                                '</li>';
                 });

  if(premium === true){ isPremium = ' table--premium'; } 

  line = '<section class="table__row' + isPremium + '">' +
         '<div class="table__col table__col--xs input__check">' +
         '<input class="input__check--box" type="checkbox" ' +
         'name="' + frag + 'Got" id="' + frag + '" />' +
         '<label class="input__check--label" for="' + frag + '"></label>' +
         '</div>' +
         '<div class="table__col table__col--md">' +
         name +
         '</div>' +
         '<div class="table__col table__col--lg" id="itemList">' +
         '<ul>' +
         itemArray +
         '</ul>' +
         '</div>' +
         '</section>';

  return line;
};

function itemCards(data, callback){
  var allItems = new Array();

  $.each($(data.characters), function(i, info){
    $.each($(info.mats), function(j, mats){
      allItems.push({"frag": mats.frag, "name": mats.item});
    });
  });
  $.each($(data.costumes), function(i, info){
    $.each($(info.mats), function(j, mats){
      allItems.push({"frag": mats.frag, "name": mats.item});
    });
  });
  $.each($(data.buildings), function(i, info){
    $.each($(info.mats), function(j, mats){
      allItems.push({"frag": mats.frag, "name": mats.item});
    });
  });
  $.each($(data.challenges), function(i, info){
    $.each($(info.mats), function(j, mats){
      allItems.push({"frag": mats.frag, "name": mats.item});
    });
  });
  $.each($(data.special), function(i, info){
    $.each($(info.mats), function(j, mats){
      allItems.push({"frag": mats.frag, "name": mats.item});
    });
  });
  allItems = $.makeArray(allItems);
  allItems = _.uniq(allItems, function(item, key, frag){
               return item.frag;
             });

  $.each($(allItems), function(i, item){
    var itemHTML = '<div class="event__item" data-frag="' +
                    item.frag +
                    '">' +
                    '<div class="event__item--total"></div>' +
                    item.name +
                    '</div>';

    $('#eventItems').append(itemHTML);
  });

  callback();
};

function itemTotals(){
  $.each($('.event__item'), function(){
    var ele = $(this),
        frag = ele.data('frag'),
        rows = $('#trackerApp').find('.table__row'),
        sum = 0;

    rows.each(function(){
      
      var ele = $(this),
          rowComplete = ele.hasClass('table__row--completed'),
          mats = ele.find('.item__req[data-item="' + frag + '"]');

      if( rowComplete || ele.hasClass('table--hidden') ){

      } else {
        sum += Number( mats.text() );
      }
    });
    
    var finalVal = sum.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

    ele.children('.event__item--total').html(finalVal);
  })
}

function zeroItems(){
  $.each($('.event__item'), function(){
    var ele = $(this);

    if(Number(ele.find('.event__item--total').text()) === 0) {
      ele.addClass('event__item--zero');
    } else {
      ele.removeClass('event__item--zero');
    }
  });
};

function finishedItems(){
  $.each($('.table__row'), function(){
    var ele = $(this),
        check = ele.find('.input__check--box'),
        checkID = check.attr('ID'),
        itemGot = false;

    if (ele.find('.input__check--box:checked').length){
      ele.addClass('table__row--completed');
    }

    check.on('click', function(){
      ele.toggleClass('table__row--completed');
      itemTotals();
      zeroItems();

      if(ele.hasClass('table__row--completed')){
        itemGot = true;
      } else {
        itemGot = false;
      }
      storageUpd(checkID, itemGot);
    })
  });
}


function storageUpd(itemID, got){
  var storageObj = {};

  storageObj = JSON.parse(localStorage.getItem('aaCivilWar'));
  storageObj[itemID] = {
    status: got
  }
  localStorage.setItem('aaCivilWar', JSON.stringify(storageObj));
}


function premiumToggle(){
  var premiumInput = $('input#premiumToggle');

  premiumInput.on('click', function(){
    $('.table--premium').toggleClass('table--hidden');
    itemTotals();
    zeroItems();

    if (premiumInput.prop('checked') === true){
      var storageObj = {};

      storageObj = JSON.parse(localStorage.getItem('aaSettings'));
      storageObj['premiumContentHide'] = {
        status: true
      }
      localStorage.setItem('aaSettings', JSON.stringify(storageObj));
    } else {
      var storageObj = {};

      storageObj = JSON.parse(localStorage.getItem('aaSettings'));
      storageObj['premiumContentHide'] = {
        status: false
      }
      localStorage.setItem('aaSettings', JSON.stringify(storageObj));
    }
  });
};

function settingsMenu(){
  var btn = $('#settingsToggle'),
      close = $('#settingsClose');

  btn.on('click', function(){
    $('.settings').fadeIn();
  });

  close.on('click', function(){
    $('.settings').fadeOut();
  })
};



$(function() {
  // Smooth scrolling function
  $('a[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top - 70
        }, 1000);
        return false;
      }
    }
  });

  // Mobile menu toggle function
  $('#menuToggle').on('click', function(){
    $('.nav').toggleClass('nav--active');
  })
});



import '../../node_modules/bootstrap/dist/js/umd/scrollspy.js'