/* Widget global do NEXOR: disponível em todas as páginas do site. */
(function () {
  if (document.getElementById('pixelnova-chat-widget')) return;

  const widget = document.createElement('div');
  widget.id = 'pixelnova-chat-widget';
  widget.innerHTML = `
    <button class="pixelnova-chat-launcher" type="button" aria-label="Abrir conversa com o NEXOR" aria-expanded="false" aria-controls="pixelnova-chat-panel">
      <span class="pixelnova-launcher-glow" aria-hidden="true"></span>
      <span class="nexor-profile" role="img" aria-label="Perfil de robô futurista gamer">
        <span class="nexor-profile-antenna"></span><span class="nexor-profile-head"><i></i><i></i><b></b></span><span class="nexor-profile-body">✦</span>
      </span>
      <span class="pixelnova-launcher-tooltip">Fale com o NEXOR</span>
    </button>
    <section class="pixelnova-chat-panel" id="pixelnova-chat-panel" aria-label="Conversa com o NEXOR" hidden>
      <div class="pixelnova-chat-panel-heading">
        <div class="pixelnova-chat-panel-identity"><span class="nexor-header-avatar" role="img" aria-label="Robô futurista gamer"><i></i><i></i><b></b></span><div><strong>NEXOR</strong><small>Seu copiloto gamer · Online</small></div></div>
        <button class="pixelnova-chat-close" type="button" aria-label="Fechar chatbot">×</button>
      </div>
      <iframe class="pixelnova-chat-frame" title="Chat com o NEXOR" src="chat-widget.html"></iframe>
    </section>`;
  document.body.appendChild(widget);

  const launcher = widget.querySelector('.pixelnova-chat-launcher');
  const panel = widget.querySelector('.pixelnova-chat-panel');
  const close = widget.querySelector('.pixelnova-chat-close');
  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    launcher.setAttribute('aria-label', open ? 'Fechar conversa com o NEXOR' : 'Abrir conversa com o NEXOR');
    if (open) widget.querySelector('.pixelnova-chat-frame').focus();
    else launcher.focus();
  }
  launcher.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });
})();
