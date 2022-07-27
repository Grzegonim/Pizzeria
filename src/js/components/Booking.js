import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();    
  }

  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {
      wrapper: element,
    };
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = select.widgets.booking.peopleAmount;
    thisBooking.dom.hoursAmount = select.widgets.booking.hoursAmount;
    thisBooking.dom.datePicker = select.widgets.datePicker.wrapper;
    thisBooking.dom.hourPicker = select.widgets.hourPicker.wrapper;
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.amountWidget = new AmountWidget(document.querySelector(thisBooking.dom.peopleAmount));
    thisBooking.amountWidget = new AmountWidget(document.querySelector(thisBooking.dom.hoursAmount));
    thisBooking.datePicker = new DatePicker(document.querySelector(thisBooking.dom.datePicker));
    thisBooking.hourPicker = new HourPicker(document.querySelector(thisBooking.dom.hourPicker));
    document.querySelector(thisBooking.dom.peopleAmount).addEventListener('click', function(){
      console.log('click!');
    });
    document.querySelector(thisBooking.dom.hoursAmount).addEventListener('click', function(){
      console.log('click!');
    });
  }
}

export default Booking;
