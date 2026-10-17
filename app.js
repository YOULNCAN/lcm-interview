'use strict';
const slides=[...document.querySelectorAll('.slide')];
const hashNames=slides.map(slide=>slide.id);
const overview=document.querySelector('#overview');
const viewer=document.querySelector('#image-viewer');
const viewerImage=document.querySelector('#viewer-image');
const viewerCanvas=document.querySelector('.viewer-canvas');
const chapterButtons=[...document.querySelectorAll('.chapter-nav button')];
let current=Math.max(0,hashNames.indexOf(location.hash.slice(1)));
let images=[],imageIndex=0;
const motionMedia=matchMedia('(prefers-reduced-motion: reduce)');
let motionDisabled=motionMedia.matches;
try{const saved=localStorage.getItem('lcm-motion');if(saved!==null)motionDisabled=saved==='off';}catch{}
function syncMotion(){
 document.body.classList.toggle('motion-off',motionDisabled);
 const button=document.querySelector('#motion');button.setAttribute('aria-pressed',String(motionDisabled));button.title=button.ariaLabel=motionDisabled?'开启动效':'关闭动效';
}
const overviewDescriptions=['申请方向与作品预览','专业背景与使用过的工具','从目标到可分享链接','需求、实现与在线交付','操作反馈与模拟演化','视觉主题与参与体验','已有尝试与下一步计划','五组九宫格，45个镜头','六张代表性学习证书','希望参与及拟交付内容','每周约8小时与协作动作','全部作品链接与联系方式'];
const overviewList=document.querySelector('.overview-list');
slides.forEach((slide,i)=>{
 if(!slide.hasAttribute('aria-labelledby'))slide.setAttribute('aria-label',slide.dataset.title);
 const button=document.createElement('button');button.dataset.go=String(i);
 const number=document.createElement('span');number.textContent=`${String(i+1).padStart(2,'0')} / 建议${slide.dataset.seconds}秒`;
 const title=document.createElement('strong');title.textContent=slide.dataset.title;
 const description=document.createElement('small');description.textContent=overviewDescriptions[i]+' ↗';
 button.append(number,title,description);overviewList.append(button);
});
function go(index,updateHash=true){
 if(index<0||index>=slides.length)return;
 const focusInsideSlide=slides.some(slide=>slide.contains(document.activeElement));current=index;
 slides.forEach((slide,i)=>{slide.hidden=i!==current;slide.inert=i!==current;slide.classList.toggle('active',i===current);if(i===current)slide.scrollTop=0;});
 chapterButtons.forEach((button,i)=>{const start=Number(button.dataset.go),end=Number(chapterButtons[i+1]?.dataset.go??slides.length);if(current>=start&&current<end)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
 overviewList.querySelectorAll('button').forEach((button,i)=>{if(i===current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
 document.querySelector('#context').textContent=slides[current].dataset.title;
 document.querySelector('#source-page').textContent=`建议 ${slides[current].dataset.seconds}秒`;
 document.querySelector('#page-counter').textContent=`${String(current+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
 document.querySelector('#progress').style.width=`${(current+1)/slides.length*100}%`;
 document.querySelector('#previous').disabled=current===0;document.querySelector('#next').disabled=current===slides.length-1;
 if(updateHash){try{history.replaceState(null,'',`#${hashNames[current]}`);}catch{location.hash=hashNames[current];}}
 document.querySelector('#announcement').textContent=`第${current+1}屏，共${slides.length}屏，${slides[current].dataset.title}`;
 if(focusInsideSlide){const heading=slides[current].querySelector('h1,h2');heading.tabIndex=-1;heading.focus({preventScroll:true});}
}
document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>{if(overview.open)overview.close();go(Number(button.dataset.go));}));
document.querySelector('.identity').addEventListener('click',event=>{event.preventDefault();go(0);});
document.querySelector('#previous').addEventListener('click',()=>go(current-1));
document.querySelector('#next').addEventListener('click',()=>go(current+1));
document.querySelector('#overview-button').addEventListener('click',()=>overview.showModal());
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.close).close()));
[overview,viewer].forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}));
function showImage(index){
 if(index<0||index>=images.length)return;imageIndex=index;
 const selected=images[index];viewerImage.src=selected.dataset.image;viewerImage.alt=selected.dataset.caption;
 document.querySelector('#viewer-caption').textContent=selected.dataset.caption;
 document.querySelector('#image-counter').textContent=`${String(index+1).padStart(2,'0')} / ${String(images.length).padStart(2,'0')}`;
 document.querySelector('#image-previous').disabled=index===0;document.querySelector('#image-next').disabled=index===images.length-1;
 viewerCanvas.classList.remove('zoomed');viewerCanvas.scrollTop=0;viewerCanvas.scrollLeft=0;
 const zoom=document.querySelector('#image-zoom');zoom.setAttribute('aria-pressed','false');zoom.textContent='查看原尺寸';
}
document.querySelectorAll('.image-opener').forEach(button=>button.addEventListener('click',()=>{images=[...slides[current].querySelectorAll('.image-opener')];showImage(images.indexOf(button));viewer.showModal();}));
document.querySelector('#image-previous').addEventListener('click',()=>showImage(imageIndex-1));
document.querySelector('#image-next').addEventListener('click',()=>showImage(imageIndex+1));
document.querySelector('#image-zoom').addEventListener('click',()=>{const zoomed=viewerCanvas.classList.toggle('zoomed');const button=document.querySelector('#image-zoom');button.setAttribute('aria-pressed',String(zoomed));button.textContent=zoomed?'适应窗口':'查看原尺寸';});
document.querySelector('#motion').addEventListener('click',()=>{motionDisabled=!motionDisabled;syncMotion();try{localStorage.setItem('lcm-motion',motionDisabled?'off':'on');}catch{}});
motionMedia.addEventListener('change',event=>{try{if(localStorage.getItem('lcm-motion')!==null)return;}catch{}motionDisabled=event.matches;syncMotion();});
async function toggleFullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{document.querySelector('#announcement').textContent='当前浏览器无法进入全屏，可使用浏览器全屏功能。';}}
document.querySelector('#fullscreen').addEventListener('click',toggleFullscreen);
document.addEventListener('fullscreenchange',()=>{const button=document.querySelector('#fullscreen');button.title=button.ariaLabel=document.fullscreenElement?'退出全屏（F）':'进入全屏（F）';});
document.addEventListener('keydown',event=>{
 if(event.ctrlKey||event.metaKey||event.altKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
 if(viewer.open){if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();showImage(imageIndex+(event.key==='ArrowRight'?1:-1));}return;}
 if(overview.open)return;
 if(['ArrowRight','PageDown','ArrowLeft','PageUp','Home','End'].includes(event.key)||event.code==='Space'&&!event.target.closest('button,a')){
  event.preventDefault();if(event.key==='Home')go(0);else if(event.key==='End')go(slides.length-1);else go(current+(['ArrowLeft','PageUp'].includes(event.key)||event.shiftKey&&event.code==='Space'?-1:1));
 }else if(event.key.toLowerCase()==='f'){event.preventDefault();toggleFullscreen();}else if(event.key.toLowerCase()==='o'){event.preventDefault();overview.showModal();}
});
window.addEventListener('hashchange',()=>{const index=hashNames.indexOf(location.hash.slice(1));if(index>=0&&index!==current)go(index,false);});
const details=[['先确定页面要解决的问题','以个人简历网站为例：把个人信息、作品和认证集中展示，方便对方了解与查看。'],['把展示需求整理成页面顺序','先整理栏目和内容，再明确页面结构，让后续实现围绕具体需求推进。'],['用AI辅助实现，由我判断与推进','AI辅助页面与前端代码实现；我对照需求检查结果，整理内容并提出修改要求。'],['检查实际表现，再继续修改','关注主要操作、不同输入、移动端表现，以及加载与分享路径；出现异常时先复现，再调整。'],['让成果成为可以访问的入口','通过GitHub部署上线，形成可打开、可分享的页面，再根据反馈继续完善。']];
document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{const index=Number(button.dataset.step);document.querySelectorAll('[data-step]').forEach((step,i)=>{step.classList.toggle('selected',i===index);step.setAttribute('aria-pressed',String(i===index));});document.querySelector('#detail-index').textContent=String(index+1).padStart(2,'0');document.querySelector('#detail-title').textContent=details[index][0];document.querySelector('#detail-text').textContent=details[index][1];}));
syncMotion();go(current,false);
