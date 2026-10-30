/* ---------- You don't need to edit this file. Change settings in config.js ---------- */

// Apply settings from config.js to every button and number on the page
function waLink(msg){
  return 'https://wa.me/'+String(SITE.whatsapp).replace(/\D/g,'')+'?text='+encodeURIComponent(msg||'');
}
document.querySelectorAll('[data-wa]').forEach(function(el){
  var key=el.dataset.wa;
  var msg=key==='main'?SITE.whatsappMessage:(SITE.helpMessages[key]||SITE.whatsappMessage);
  el.href=waLink(msg);
});
document.querySelectorAll('[data-call]').forEach(function(el){
  el.href='tel:'+String(SITE.phone).replace(/[^\d+]/g,'');
});
document.querySelectorAll('[data-phone-text]').forEach(function(el){el.textContent=SITE.phone;});
document.querySelectorAll('[data-countries]').forEach(function(el){el.textContent=SITE.countries;});


// Get the video ID from any YouTube link (shorts, watch, youtu.be, embed)
function youtubeId(url){
  var m=(url||'').match(/(?:shorts\/|watch\?v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m?m[1]:null;
}

// Photo placeholders when an image file is missing
function photoPlaceholder(img,label){
  var d=document.createElement('div');d.className='ph';
  d.innerHTML='<svg width="56" height="56" viewBox="0 0 24 24" fill="#c9b597"><circle cx="12" cy="8" r="4.5"/><path d="M3 22c0-5 4-8 9-8s9 3 9 8z"/></svg>'+label;
  img.replaceWith(d);
}
document.querySelectorAll('.hero-carousel img').forEach(function(img){
  var label=img.alt;
  img.addEventListener('error',function(){photoPlaceholder(img,label);});
  if(img.complete&&img.naturalWidth===0)photoPlaceholder(img,label);
});

// Build the video slides (thumbnail + play button; video loads only when tapped)
document.querySelectorAll('.video-carousel .slide').forEach(function(slide,k){
  var id=youtubeId(slide.dataset.url), cap=slide.dataset.cap||'';
  if(!id){
    slide.innerHTML='<div class="ph"><svg width="54" height="54" viewBox="0 0 24 24" fill="#888"><path d="M8 5v14l11-7z"/></svg>Video review '+(k+1)+'<br><small>Paste a YouTube Shorts link</small></div>';
    return;
  }
  slide.dataset.id=id;
  slide.innerHTML='<button class="facade" aria-label="Play video" style="background-image:url(https://i.ytimg.com/vi/'+id+'/hqdefault.jpg)"><span class="play"></span><span class="vcap"></span></button>';
  slide.querySelector('.vcap').textContent=cap;
  slide.querySelector('.facade').onclick=function(){
    slide.innerHTML='<iframe src="https://www.youtube.com/embed/'+id+'?autoplay=1&playsinline=1&rel=0" title="'+cap.replace(/"/g,'')+'" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    slide.closest('.carousel')._stop();
  };
});
// Put the thumbnail back (stops the video) when the slide changes
function resetVideo(slide){
  if(slide.dataset.id && slide.querySelector('iframe')){
    var id=slide.dataset.id, cap=slide.dataset.cap||'';
    slide.innerHTML='<button class="facade" aria-label="Play video" style="background-image:url(https://i.ytimg.com/vi/'+id+'/hqdefault.jpg)"><span class="play"></span><span class="vcap"></span></button>';
    slide.querySelector('.vcap').textContent=cap;
    slide.querySelector('.facade').onclick=function(){
      slide.innerHTML='<iframe src="https://www.youtube.com/embed/'+id+'?autoplay=1&playsinline=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      slide.closest('.carousel')._stop();
    };
  }
}

// Carousel behaviour (works for both carousels)
document.querySelectorAll('.carousel').forEach(function(c){
  var track=c.querySelector('.track'), slides=track.children, n=slides.length,
      dots=c.nextElementSibling, i=0, timer, delay=+c.dataset.autoplay||0;
  for(var k=0;k<n;k++){(function(k){
    var b=document.createElement('button');b.setAttribute('aria-label','Slide '+(k+1));
    b.onclick=function(){go(k);restart();};dots.appendChild(b);})(k);}
  function go(k){
    if(slides[i])resetVideo(slides[i]);
    i=(k+n)%n;track.style.transform='translateX(-'+(i*100)+'%)';
    Array.prototype.forEach.call(dots.children,function(d,j){d.className=j===i?'on':'';});
  }
  function restart(){clearInterval(timer);if(delay)timer=setInterval(function(){go(i+1);},delay);}
  c._stop=function(){clearInterval(timer);};
  c.querySelector('.prev').onclick=function(){go(i-1);restart();};
  c.querySelector('.next').onclick=function(){go(i+1);restart();};
  var x0=null;
  c.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
  c.addEventListener('touchend',function(e){if(x0===null)return;
    var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){go(dx<0?i+1:i-1);restart();}x0=null;});
  go(0);restart();
});
