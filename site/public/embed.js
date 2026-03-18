/*!
 * AgentRank Embed v1
 * Usage: <script src="https://agentrank-ai.com/embed.js" data-tool="owner/repo"></script>
 */
(function () {
  var BASE = 'https://agentrank-ai.com';
  var scripts = document.querySelectorAll('script[data-tool]');
  scripts.forEach(function (script) {
    var tool = script.getAttribute('data-tool');
    if (!tool) return;
    // Accept both "owner/repo" and "owner--repo" slug formats
    var slug = tool.replace('/', '--');
    var src = BASE + '/api/embed/' + slug + '.html';
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:inline-block;max-width:340px;width:100%;line-height:0;';
    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.setAttribute('width', '340');
    iframe.setAttribute('height', '170');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.style.cssText = 'border:none;border-radius:6px;display:block;width:100%;max-width:340px;height:170px;overflow:hidden;';
    iframe.title = 'AgentRank score for ' + tool;
    wrap.appendChild(iframe);
    if (script.parentNode) {
      script.parentNode.insertBefore(wrap, script.nextSibling);
    }
  });
})();
