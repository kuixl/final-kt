/* nichive - UI: burger nav, slider, form, year */
(function(){
  // --- mobile burger nav ---
  var burger=document.querySelector('.burger');
  var nav=document.querySelector('.nav');
  if(burger&&nav){
    burger.addEventListener('click',function(){
      nav.classList.toggle('open');
      burger.textContent=nav.classList.contains('open')?'✕':'☰';
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){nav.classList.remove('open');burger.textContent='☰';});
    });
  }

  // --- subscribe form: strike lines → dissolve → assemble success ---
  var form=document.querySelector('#subscribe-form');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var s=document.querySelector('#subscribe-success');
      form.classList.add('sent');                 // strikethrough sweeps
      setTimeout(function(){form.classList.add('gone');},550);  // dissolve
      setTimeout(function(){
        form.style.display='none';
        if(s)s.classList.add('show');             // success assembles part by part
      },1050);
    });
  }

  // --- assemble-on-scroll (IntersectionObserver) ---
  var assemblies=document.querySelectorAll('[data-assemble]');
  if(assemblies.length){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);} });
    },{threshold:.25});
    assemblies.forEach(function(el){io.observe(el);});
  }

  // --- animated ASCII art (archive feed) injected into footer ---
  (function(){
    var footer=document.querySelector('.footer .wrap');
    if(!footer)return;
    var pre=document.createElement('pre');
    pre.className='ascii ascii--footer';
    var legal=footer.querySelector('.footer__legal');
    footer.insertBefore(pre,legal);
    var dens=' .:-=+*#%@░▒▓█';
    var W=64;
    var rows=[
      'nichive://archive/object-03  ',
      '> margiela tabi · ss89 · paris · calf leather · 8 stitch/cm  ',
      '> acquiring frame  ',
      '> next object in 17 days · one email / month  ',
    ];
    function bar(seed){var s='';for(var i=0;i<W;i++){var v=(Math.sin((i*0.3)+seed)+1)/2;s+=dens[Math.floor(v*(dens.length-1))];}return s;}
    var t=0;
    setInterval(function(){
      t+=0.25;
      var out=[];
      out.push(bar(t));
      for(var i=0;i<rows.length;i++){
        var line=rows[i];
        var shift=Math.floor(t*4)%line.length;
        out.push((line.slice(shift)+line.slice(0,shift)).slice(0,W));
      }
      out.push(bar(t*0.7+2));
      pre.textContent=out.join('\n');
    },120);
  })();

  // --- home slider ---
  var slider=document.querySelector('[data-slider]');
  if(slider){
    var track=slider.querySelector('.slider__track');
    var slides=slider.querySelectorAll('.slide');
    var dotsBox=slider.querySelector('.slider__dots');
    var i=0;
    slides.forEach(function(_,k){
      var d=document.createElement('span');d.className='dot'+(k===0?' active':'');
      d.addEventListener('click',function(){i=k;render();});
      dotsBox.appendChild(d);
    });
    var dots=dotsBox.querySelectorAll('.dot');
    function render(){
      track.style.transform='translateX(-'+(i*100)+'%)';
      dots.forEach(function(d,k){d.classList.toggle('active',k===i);});
    }
    slider.querySelector('.prev').addEventListener('click',function(){i=(i-1+slides.length)%slides.length;render();});
    slider.querySelector('.next').addEventListener('click',function(){i=(i+1)%slides.length;render();});
    setInterval(function(){i=(i+1)%slides.length;render();},6000);
  }
})();
