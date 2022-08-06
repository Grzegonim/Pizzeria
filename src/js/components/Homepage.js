import {templates} from '../settings.js';

class Homepage{
  constructor(element){
    const thisHome = this;
    thisHome.render(element);
    thisHome.initWidgets();
  }
  render(element){
    const thisHome = this;
    const generatedHTML = templates.homepage();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
    const navList = document.querySelectorAll('.main-nav a');
    const linkList = document.querySelectorAll('.home-top a');
    for(let link of linkList){
      link.addEventListener('click', function(){
        const hash = link.getAttribute('href');
        for(let nav of navList){
          const navHash = nav.getAttribute('href');
          if(hash == navHash){
            nav.classList.add('active');
            const Hash = nav.getAttribute('href').replace('#', '');
            window.location.hash = '#/' + Hash;
            window.location.reload();        
          } else if(hash !== navHash){
            nav.classList.remove('active');
          }
        }  
      }); 
    }

  }

  initWidgets() {
    const thisHome = this;
    const element = document.querySelector('.main-carousel');
    new Flickity(element, {
      cellAlign: 'left',
      contain: true,
      autoPlay: 3000,
      prevNextButtons: false,
      freeScroll: true,
      wrapAround: true,
    })
  }
}

export default Homepage;