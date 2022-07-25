import {templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';

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
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.amountWidget = new AmountWidget(document.querySelector('.people-amount'));
    thisBooking.amountWidget = new AmountWidget(document.querySelector('.hours-amount'));
    document.querySelector('.people-amount').addEventListener('click', function(){
        console.log('click!')
    });
    document.querySelector('.hours-amount').addEventListener('click', function(){
        console.log('click!')
    });
  }
}

export default Booking;
