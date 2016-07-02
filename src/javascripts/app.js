const underscore = require('underscore');
global._ = underscore

import 'vendor/jquery.animateNumber.min.js';

var storageObj = {},
    filters = [];

/* localStorage
 * -----------------------------
 * localStorage load tasks
 */
if (!localStorage['aaSpidey']) {
  localStorage['aaSpidey'] = JSON.stringify({});
} else {
  var stored = JSON.parse(localStorage.aaSpidey),
      storedLength = Object.keys(stored).length;

  for (var i = 0; i < storedLength; i++) {
    var key = Object.keys(stored)[i],
        card = $('.card[id="' + key + '"]'),
        itemCheck = card.find('input[data-type="checked"]'),
        itemTrack = card.find('input[data-type="track"]'),
        matCheck = card.find('.list');

    // If the Key is marked as checked...
    if(stored[key].checked){
      itemCheck.prop('checked', true);
      card.addClass('card--checked');
    };
    if(stored[key].tracked){
      itemTrack.prop('checked', true);
      card.addClass('card--tracked');
    };
    if(stored[key].mats){
      _.each(stored[key].mats, function(value, index){

        var cardMaterial = card.find('.list:eq(' + index + ')'),
            cardMaterialBox = cardMaterial.find('.input__box');

        if(stored[key].mats[index] === true) {
          cardMaterialBox.prop('checked', true);
        }
      });
    };
  }
}

if (localStorage['aaCivilWar'] || localStorage['aaSettings']) {
  var civilWarHTML = '<div class="content">' +
                       '<section class="row">' +
                         '<h2 class="text--center">Welcome back!</h2>' +
                         '<p>Thanks for taking part in the Event Tracker Alpha during the Civil War event. There\'s a little bit of data left over from that that you will no longer need. Just click the button below, and that will all be cleared up for you!</p>' +
                         '<p>Good luck with the Spider-Man event, and thanks for coming back!</p>'+
                         '<p><em>- getignited</em></p>' +
                         '<button class="btn btn__bordered btn--wide btn--event" id="cleanUp">Clean up</button>'+
                       '</section>' +
                     '</div>';
  $(civilWarHTML).insertBefore('main');
  $('#cleanUp').on('click', function(){
    localStorage.removeItem('aaSettings');
    localStorage.removeItem('aaCivilWar');
    location.reload();
  });

}


/* cards
 * -----------------------------
 * Watch Card objects for any changes to checkboxes
 */
function cards(){
  $.each($('.card'), function(){
    var ele = $(this),
        itemID = ele.attr('id'),
        checkedButton = ele.find('input'),
        mat = ele.find('.list'),
        matIndex = mat.length;

    checkedButton.on('change', function(){

      var tickboxData = $(this).data('type'),
          itemStatus,
          itemTrack;

      // Check if Card is marked as Checked
      if(tickboxData === 'checked'){
        itemStatus = $(this).prop('checked');

        if(itemStatus){
          ele.addClass('card--checked');
        } else {
          ele.removeClass('card--checked');
        }
      }
      // Check if Card is marked as Tracked
      if(tickboxData === 'track'){
        itemTrack = $(this).prop('checked');

        if(itemTrack){
          ele.addClass('card--tracked');
        } else {
          ele.removeClass('card--tracked');
        }
      }
      // Check which of the two toggles are active to pass to localStorage
      itemStatus = ele.find('input[data-type="checked"]').prop('checked');
      itemTrack = ele.find('input[data-type="track"]').prop('checked');

      storageObj = JSON.parse(localStorage.getItem('aaSpidey'));
      storageObj[itemID] = _.defaults({
        checked: false,
        tracked: false,
        mats: []
      });
      storageObj[itemID].checked = itemStatus;
      storageObj[itemID].tracked = itemTrack;
      if(matIndex > 1) {
        _.forEach(mat, function(material, materialIndex){
          var materialCheck = $(material).find('.input__box').prop('checked');
          storageObj[itemID].mats[materialIndex] = materialCheck;
        });
      }
      localStorage.setItem('aaSpidey', JSON.stringify(storageObj));
      filterSelection();
      materialCount();
    })
  });
};



function materialList() {
  var allMaterials = new Array();

  $.each($('.list[data-type="material"]'), function(i, info) {
    var ele = $(this),
        materialID = ele.attr('id'),
        materialName = ele.children('.list__desc').html(),
        materialAmount = ele.children('.list__value').html();

    if(materialAmount > 0){
      allMaterials.push({
        "name": materialName,
        "frag": materialID
      });
    };
  });
  allMaterials = $.makeArray(allMaterials);
  allMaterials = _.uniq(allMaterials, function(item, key, frag){
                   return item.frag;
                 });
  allMaterials = _.sortBy(allMaterials, 'name');

  $.each($(allMaterials), function(i, item){
    var materialHTML;

    materialHTML = '<li class="list list--small" id="' + item.frag + '" data-type="itemTotals">' +
                   '<div class="list__segment list__context text--center">' +
                   '<img class="img img__icon" src="/images/16-spidey/' + item.frag + '@4x.png" alt="' + item.name + '">' +
                   '</div>' +
                   '<div class="list__desc">' + item.name + '</div>' +
                   '<div class="list__segment list__value">0</div>' +
                   '</li>';
    $('#materialList').append(materialHTML);
  });
};

function materialCount(){
  var listedMaterial = $('.list[data-type="itemTotals"]');
  $.each(listedMaterial, function(){
    var ele = $(this),
        materialFrag = ele.attr('id'),
        card = $('.card'),
        sum = 0,
        totalValue;

    card.each(function(){
      var ele = $(this),
          cardMaterial = ele.find('.list[id="' + materialFrag + '"]'),
          materialRequired = cardMaterial.children('.list__value').text(),
          cardCompleted = ele.hasClass('card--checked'),
          cardHidden = ele.hasClass('card--hidden'),
          cardMaterialChecked = cardMaterial.find('input').prop('checked');

      if(cardCompleted || cardHidden || cardMaterialChecked) {

      } else {
        sum += Number( materialRequired );
      }
    });

    ele.children('.list__value').animateNumber({
      number: sum,
      numberStep: $.animateNumber.numberStepFactories.separator(',')
    });
  });
}

// settings
// ----------------------
function settings(){
  // Premium Items toggle
  $('#premiumToggle').on('click', function(){
    $.each($('.card'), function(){
      var ele = $(this);
      premiumToggle(ele);
    });
  });
  // Complete Items toggle
  $('#completeToggle').on('click', function(){

    $.each($('.card'), function(){
      var ele = $(this);
      completeToggle(ele);
    });
  });
}


function filterSelection(){

  // Check what the filter critera are and add to an array
  $.each($('input[data-type="toggles"]'), function(){
    var ele = $(this);

    if(ele.prop('checked')){
      filters.push(ele.data('target'));
    } else {
      filters = $.grep(filters, function(value){
        return value != ele.data('target');
      });
    }
    cardSettings(filters);
  });
}

$('input[data-type="toggles"]').on('change', function(){
  filterSelection();
  materialCount();
});


function cardSettings(filters){
  // for each item in the Filters array, check to see
  // if the card matches that items criteria.
  // If the card matches one or all critera, hide the card.
  // If the card is tracked, display it regardless
  $.each($('.card'), function(){
    var ele = $(this),
        j = 0,
        k = 0;

    $.each($(filters), function(key, value){

      if(value === 'card--tracked'){
        if(ele.hasClass(value)){
          ele.addClass('card--trackedon');
        } else {
          k++;
        }
      }

      if(ele.hasClass(value) && value !== 'card--tracked'){
        ele.removeClass('card--trackedon');
        j++;
      }
    });

    if(k > 0){
      ele.hide(200);
      ele.addClass('card--hidden');
    } else {
      if(j > 0){
        ele.hide(200);
        ele.addClass('card--hidden');
      } else {
        ele.show(200);
        ele.removeClass('card--hidden');
      }
    }
  });
}




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

  $('#navMenu').on('click', function(){
    $('.content').toggleClass('content--navopen');
    $(this).toggleClass('nav__button--open');
    $('.sidebar').toggleClass('sidebar--navopen');
  });

  $("img").error(function(){
    $(this).addClass('img--error');
  });

  $('button').on('click', function(){
    $(this).blur();
  });

  $('.nav__toggle').on('click', function(){
    var ele = $(this),
        drawerHeight = ele.next().get(0).scrollHeight;

    ele.toggleClass('nav__toggle--open');
    if(ele.hasClass('nav__toggle--open')){
      ele.next().animate({height: drawerHeight}, 200, function(){
        $(this).height('auto');
      });
    } else {
      ele.next().animate({height: 0}, 200);
    }
  })
});

cards();
materialList();
materialCount();

import '../../node_modules/bootstrap/dist/js/umd/scrollspy.js';
