import {select, settings, templates, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';
class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.bookedTable = '';
    thisBooking.startersArray = [];
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        startDateParam,
        endDateParam,
        settings.db.notRepeatParam,
      ],
      eventsRepeat: [
        endDateParam,
        settings.db.repeatParam,
      ],
    };
    //console.log('getData params', params);

    const urls = {
      booking:        settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.event   
                      + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.event   
                      + '?' + params.eventsRepeat.join('&'),
    };
    //console.log('getData params', urls.eventsCurrent);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1))  
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
      }
    }
    thisBooking.updateDOM();
    //console.log(thisBooking.booked);
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvaible = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'      
    ){
      allAvaible = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvaible
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {
      wrapper: element,
    };
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = document.querySelector(select.widgets.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.widgets.booking.hoursAmount);
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.widgets.booking.tables);
    thisBooking.dom.floor = thisBooking.dom.wrapper.querySelector('.floor-plan');
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector('.booking-form');
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.amountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.peopleAmount.addEventListener('click', function(){
    });
    thisBooking.dom.hoursAmount.addEventListener('click', function(){
      //console.log('click!');
    });
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
      thisBooking.resetBooked();
    });
    thisBooking.dom.floor.addEventListener('click', function(event){
      thisBooking.bookingTable(event);
    });
    thisBooking.dom.form.addEventListener('submit', function(){
      thisBooking.sendBooking();
    });
    thisBooking.dom.form.addEventListener('change', function(event){
      if(!thisBooking.startersArray[event.target.value] && event.target.value == 'water' && event.target.checked){
        thisBooking.startersArray.push(event.target.value);
        //console.log(thisBooking.startersArray);
      } else if(!thisBooking.startersArray[event.target.value] && event.target.value == 'bread' && event.target.checked) {
        thisBooking.startersArray.push(event.target.value);
        //console.log(thisBooking.startersArray);
      } else if(event.target.checked == false && event.target.value){
        const indexOfStarter = thisBooking.startersArray.indexOf(event.target.value);
        thisBooking.startersArray.splice(indexOfStarter);
      }
    });
  }

  bookingTable(event){
    const thisBooking = this;
    if(event.target.classList.contains('table')){
      if(!event.target.classList.contains('booked') && !event.target.classList.contains('booked-table')){
        const bookedTable = document.querySelector('.booked-table');
        if(bookedTable != null){
          bookedTable.classList.remove('booked-table');
        }
        event.target.classList.add('booked-table');
        const tableId = event.target.getAttribute(settings.booking.tableIdAttribute);
        thisBooking.bookedTable = tableId;
      } else if(!event.target.classList.contains('booked') && event.target.classList.contains('booked-table')){
        event.target.classList.remove('booked-table');
      } else {
        alert('This is booked table!');
      }
    }
  }

  resetBooked(){
    const tableList = document.querySelectorAll('.table');
    for(let table of tableList){
      table.classList.remove('booked-table');
    }
  }

  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    const ppl = thisBooking.dom.peopleAmount.querySelector('input').value;
    const duration = thisBooking.dom.hoursAmount.querySelector('input').value;
    //console.log(thisBooking.booked);
    const bookLoad = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.bookedTable),
      duration: parseInt(duration),
      ppl: parseInt(ppl),
      starters: thisBooking.startersArray,
      phone: thisBooking.dom.form.phone.value,
      address: thisBooking.dom.form.address.value,
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookLoad),
    };
    fetch(url, options);
    thisBooking.updateDOM();
    thisBooking.makeBooked(bookLoad.date, bookLoad.hour, bookLoad.duration, bookLoad.table);
  }  
}

export default Booking;
