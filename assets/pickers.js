/* Themed option dialogs; original selects remain the source of form values. */
(() => {
  function enhance(select) {
    if (select.dataset.picker || select.multiple || select.size > 1) return;
    select.dataset.picker = 'true';
    const label = select.labels?.[0];
    const name = select.getAttribute('aria-label') || label?.childNodes[0]?.textContent.trim() || 'Choose an option';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'picker-trigger';
    trigger.id = select.id + '-trigger';
    trigger.setAttribute('aria-haspopup', 'dialog');
    const dialog = document.createElement('dialog');
    dialog.className = 'option-picker';
    dialog.id = select.id + '-picker';
    dialog.dataset.trigger = trigger.id;
    dialog.setAttribute('aria-labelledby', dialog.id + '-title');
    trigger.setAttribute('aria-controls', dialog.id);
    const header = document.createElement('div');
    header.className = 'picker-header';
    const title = document.createElement('h2');
    title.id = dialog.id + '-title';
    title.textContent = name;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'picker-close';
    close.textContent = 'Cancel';
    close.dataset.closeDialog = '';
    header.append(title, close);
    const options = document.createElement('div');
    options.className = 'picker-options';
    dialog.append(header, options);
    document.body.append(dialog);
    select.after(trigger);
    select.hidden = true;
    if (label) label.htmlFor = trigger.id;
    let pending = null;
    function sync() {
      trigger.textContent = select.selectedOptions[0]?.textContent || 'Choose';
      trigger.setAttribute('aria-label', name + ': ' + trigger.textContent);
      trigger.disabled = select.disabled;
      for (const button of options.children) {
        button.setAttribute('aria-pressed', String(Number(button.dataset.index) === select.selectedIndex));
      }
    }
    function populate() {
      options.replaceChildren();
      Array.from(select.options).forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'picker-option';
        button.textContent = option.textContent;
        button.dataset.index = index;
        button.disabled = option.disabled || option.parentElement.disabled;
        button.addEventListener('click', () => {
          pending = index;
          close.click();
        });
        options.append(button);
      });
      sync();
    }
    trigger.addEventListener('click', () => {
      pending = null;
      populate();
      SwimNavigation.openDialog(dialog, trigger);
      (options.querySelector('[aria-pressed="true"]:not(:disabled)') || options.querySelector('button:not(:disabled)'))?.focus();
    });
    options.addEventListener('keydown', event => {
      const buttons = Array.from(options.querySelectorAll('button:not(:disabled)'));
      const index = buttons.indexOf(document.activeElement);
      let next;
      if (event.key === 'ArrowDown') next = (index + 1) % buttons.length;
      if (event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next !== undefined) { event.preventDefault(); buttons[next]?.focus(); }
    });
    dialog.addEventListener('close', () => {
      if (pending === null) return;
      const changed = select.selectedIndex !== pending;
      select.selectedIndex = pending;
      pending = null;
      sync();
      if (changed) {
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    select.addEventListener('change', sync);
    new MutationObserver(sync).observe(select, { attributes: true, childList: true, subtree: true });
    sync();
  }
  document.querySelectorAll('select').forEach(enhance);
})();
