/* Rytm — landing page
   JavaScript puro, sem dependências. Recria a demonstração interativa:
   ilha animada, janela do app (páginas, Kanban/Lista/Tabela, arrastar cards,
   calendário, notas, relatórios), cronômetro ao vivo e scroll suave com motion blur. */
(function () {
  'use strict';

  var CONFIG = { autoplay: true, blur: 14 };

  // ---------- Dados de exemplo ----------
  var COLS = [['iniciar', 'Iniciar'], ['dev', 'Em desenvolvimento'], ['rev', 'Em revisão'], ['ok', 'Concluído']];
  var SIDE = [
    ['home', 'Início', 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
    ['tasks', 'Tarefas', 'M4 4h6v16H4zM14 4h6v10h-6z'],
    ['cal', 'Calendário', 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4'],
    ['notes', 'Notas', 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5'],
    ['rep', 'Relatórios', 'M4 20V10M10 20V4M16 20v-7M22 20H2']
  ];
  var NOTES = [
    { title: 'Briefing · Café Brasa', date: 'Hoje', body: 'Key visual para a campanha de inverno.\nTom acolhedor, luz quente, foco no café coado.\n\nEntregas: feed 4:5, stories 9:16 e banner do site.\nReferências salvas no Pinterest da marca.' },
    { title: 'Ideias · Aurora Moda', date: 'Ontem', body: 'Reels com transições no ritmo da música.\nTestar cortes no beat e texto animado curto.\n\nCapa do reels com a peça principal da coleção.' },
    { title: 'Checklist de entrega', date: '28 out', body: 'Exportar em sRGB.\nNomear arquivos com cliente_peça_data.\nEnviar versão em PDF para aprovação.\nSubir finais na pasta do cliente.' }
  ];
  var PROGS = [['Photoshop', 14, 52], ['Figma', 11, 41], ['Premiere', 8, 30], ['After Effects', 5, 19], ['Illustrator', 4, 14]];
  var DAYS = [
    { label: 'Seg 3', today: true, events: [[9, 11.5, 'Key visual', 'Café Brasa', 'a'], [14, 15, 'Call de briefing', 'Studio Norte', 'b']] },
    { label: 'Ter 4', events: [[10, 13, 'Edição do reels', 'Aurora Moda', 'a'], [15, 17, 'Moodboard', 'Aurora Moda', 'c']] },
    { label: 'Qua 5', events: [[9.5, 12, 'Carrossel', 'Studio Norte', 'a'], [16, 17, 'Aprovação', 'Café Brasa', 'd']] },
    { label: 'Qui 6', events: [[11, 14.5, 'Animação do logo', 'Studio Norte', 'a']] },
    { label: 'Sex 7', events: [[9, 10, 'Revisão semanal', 'Interno', 'b'], [13, 16, 'Identidade visual', 'Clínica Vita', 'c']] }
  ];
  var EVC = { a: ['rgba(79,179,156,0.2)', '#7fd4bf', '#4fb39c'], b: ['rgba(139,143,151,0.18)', '#c3c6cc', '#8b8f97'], c: ['rgba(120,150,230,0.18)', '#aebff0', '#7896e6'], d: ['rgba(232,176,75,0.18)', '#e8b04b', '#e8b04b'] };
  var DOT = { iniciar: '#8b8f97', dev: '#4fb39c', rev: '#e8b04b', ok: '#7896e6' };
  var TAG = {
    red: 'padding: 2px 8px; border-radius: 6px; background: rgba(239,122,110,0.15); color: #ef7a6e',
    amber: 'padding: 2px 8px; border-radius: 6px; background: rgba(232,176,75,0.15); color: #e8b04b'
  };
  var ISLAND = [[150, 40, 20], [340, 44, 22], [400, 132, 34], [300, 44, 22]];

  // ---------- Estado ----------
  var state = {
    phase: 0, secs: 7854, tick: 0,
    page: 'tasks', view: 'kanban', dragId: null, overCol: null, note: 0, range: 0,
    cards: [
      { id: 'c1', title: 'Key visual · Campanha de inverno', client: 'Café Brasa', prog: 'Photoshop', col: 'dev', spent: '2h 10m', due: 'Hoje 15h', tag: 'URGENTE', kind: 'red' },
      { id: 'c2', title: 'Moodboard · Coleção verão', client: 'Aurora Moda', prog: 'Figma', col: 'iniciar', spent: '—', due: 'Amanhã' },
      { id: 'c3', title: 'Edição do reels de lançamento', client: 'Aurora Moda', prog: 'Premiere', col: 'iniciar', spent: '—', due: 'Sex' },
      { id: 'c6', title: 'Animação do logo', client: 'Studio Norte', prog: 'After Effects', col: 'iniciar', spent: '—', due: 'Seg' },
      { id: 'c4', title: 'Carrossel · 5 dicas de branding', client: 'Studio Norte', prog: 'Figma', col: 'rev', spent: '3h 05m', due: 'Qua', tag: 'Ajustes', kind: 'amber' },
      { id: 'c5', title: 'Logo e manual de marca', client: 'Clínica Vita', prog: 'Illustrator', col: 'ok', spent: '6h 40m', due: '28 out' }
    ]
  };
  var renderedPage = null;

  // ---------- Utilidades ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(x) { return String(x).padStart(2, '0'); }
  function fmt(n) { return pad(Math.floor(n / 3600)) + ':' + pad(Math.floor((n % 3600) / 60)) + ':' + pad(n % 60); }
  function colIndex(k) { for (var i = 0; i < COLS.length; i++) if (COLS[i][0] === k) return i; return -1; }
  function timeSpan() { return '<span data-time>' + fmt(state.secs) + '</span>'; }
  function each(list, fn) { return list.map(fn).join(''); }
  var CHECK_ICON = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#04110d" stroke-width="3.4" stroke-linecap="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>';
  var NEXT_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>';

  function decorate(c) {
    var running = c.id === 'c1' && c.col === 'dev';
    var done = c.col === 'ok';
    var i = colIndex(c.col);
    return {
      c: c, running: running, done: done, hasNext: i < COLS.length - 1,
      cardStyle: 'background: #1b1c20; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 9px; user-select: none; ' +
        (running ? 'border: 1px solid rgba(79,179,156,0.55); box-shadow: 0 0 0 3px rgba(79,179,156,0.08); ' : 'border: 1px solid #26282d; ') +
        (done ? 'opacity: .7; ' : ''),
      status: COLS[i][1],
      checkStyle: 'width: 20px; height: 20px; flex-shrink: 0; border-radius: 6px; padding: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; ' +
        (done ? 'background: #4fb39c; border: 1.5px solid #4fb39c' : 'background: transparent; border: 1.5px solid #30333a'),
      titleStyle: 'flex: 1; min-width: 0; font-size: 13px; ' + (done ? 'color: #8b8f97; text-decoration: line-through' : 'color: #e7e8ea')
    };
  }

  var SEG = 'border: 0; font-family: inherit; font-size: 12px; padding: 6px 12px; border-radius: 8px; cursor: pointer; ';
  function segStyle(on) { return SEG + (on ? 'background: #1f2024; color: #e7e8ea' : 'background: transparent; color: #8b8f97'); }
  function colStyle(over) {
    return 'border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 8px; min-height: 360px; ' +
      (over ? 'background: rgba(79,179,156,0.08); box-shadow: inset 0 0 0 1px rgba(79,179,156,0.4)' : 'background: #0f1013; box-shadow: inset 0 0 0 1px transparent');
  }

  // ---------- Barra lateral ----------
  function renderSide() {
    var base = 'display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border: 0; border-radius: 8px; font-family: inherit; font-size: 13px; text-align: left; cursor: pointer; ';
    $('#side-items').innerHTML = each(SIDE, function (s) {
      return '<button class="side" data-act="page" data-v="' + s[0] + '" aria-label="' + s[1] + '"' + (state.page === s[0] ? ' aria-current="page"' : '') +
        ' style="' + base + (state.page === s[0] ? 'background: rgba(255,255,255,0.06); color: #e7e8ea' : 'background: transparent; color: #8b8f97') + '">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + s[2] + '"></path></svg>' +
        '<span class="sidelabel">' + s[1] + '</span></button>';
    });
  }

  // ---------- Páginas ----------
  function pageHome(all) {
    var open = all.filter(function (d) { return !d.done; });
    var stat = function (label, value, color) {
      return '<div style="background: #1a1b1f; border: 1px solid #222429; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 6px"><span style="font-size: 12px; color: #8b8f97">' + label + '</span><span class="tnum" style="font-size: 26px; font-weight: 600' + (color ? '; color: ' + color : '') + '">' + value + '</span></div>';
    };
    return '<div style="display: flex; flex-direction: column; gap: 20px">' +
      '<div style="display: flex; flex-direction: column; gap: 4px"><span style="font-size: 22px; font-weight: 600; letter-spacing: -0.02em">Bom dia, Marina</span>' +
      '<span style="font-size: 13px; color: #8b8f97">Segunda-feira · ' + open.length + ' tarefas abertas</span></div>' +
      '<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px">' +
      stat('Tempo hoje', timeSpan(), '#4fb39c') +
      stat('Em desenvolvimento', all.filter(function (d) { return d.c.col === 'dev'; }).length) +
      stat('Concluídas', all.filter(function (d) { return d.done; }).length) + '</div>' +
      '<div style="display: flex; flex-direction: column; gap: 8px"><span style="font-size: 13px; font-weight: 600; color: #c3c6cc">Para hoje</span>' +
      each(open, function (d) {
        return '<div class="row" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-radius: 12px; border: 1px solid #222429">' +
          '<span style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><span style="font-size: 13px">' + esc(d.c.title) + '</span><span style="font-size: 12px; color: #8b8f97">' + esc(d.c.client) + ' · ' + esc(d.c.prog) + '</span></span>' +
          '<span style="font-size: 12px; color: #8b8f97; white-space: nowrap">' + esc(d.c.due) + '</span></div>';
      }) + '</div></div>';
  }

  function kanban(all) {
    return '<div style="display: grid; grid-template-columns: repeat(4, minmax(180px, 1fr)); gap: 12px; overflow-x: auto; flex: 1; min-height: 0">' +
      each(COLS, function (col) {
        var cards = all.filter(function (d) { return d.c.col === col[0]; });
        return '<div class="kcol" data-col="' + col[0] + '" style="' + colStyle(false) + '">' +
          '<span style="font-size: 12px; color: #8b8f97; padding: 2px 4px; display: flex; justify-content: space-between"><span>' + col[1] + '</span><span class="tnum">' + cards.length + '</span></span>' +
          each(cards, function (d) {
            var c = d.c;
            return '<div class="kcard" draggable="true" data-card="' + c.id + '" style="' + d.cardStyle + '">' +
              '<span style="font-size: 13px; line-height: 1.35">' + esc(c.title) + '</span>' +
              '<span style="display: flex; justify-content: space-between; align-items: center; gap: 6px; font-size: 11px">' +
              '<span style="display: flex; gap: 6px; flex-wrap: wrap"><span style="padding: 2px 8px; border-radius: 6px; background: rgba(139,143,151,0.16); color: #c3c6cc">' + esc(c.client) + '</span>' +
              (c.tag ? '<span style="' + TAG[c.kind] + '">' + esc(c.tag) + '</span>' : '') + '</span>' +
              (d.hasNext ? '<button class="mini" data-act="next" data-v="' + c.id + '" aria-label="Mover para a próxima coluna" style="width: 24px; height: 24px; border-radius: 7px; border: 0; background: #24262b; color: #e7e8ea; display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer">' + NEXT_ICON + '</button>' : '') +
              '</span>' +
              '<span style="display: flex; justify-content: space-between; font-size: 11px; color: #8b8f97"><span>' + esc(c.prog) + '</span>' +
              (d.running ? '<span class="tnum" style="color: #4fb39c; display: flex; align-items: center; gap: 5px"><span class="dot" style="width: 6px; height: 6px; border-radius: 50%; background: #4fb39c"></span>' + timeSpan() + '</span>'
                : '<span class="tnum">' + esc(c.spent) + '</span>') +
              '</span></div>';
          }) + '</div>';
      }) + '</div>';
  }

  function list(all) {
    return '<div style="display: flex; flex-direction: column; gap: 6px">' + each(all, function (d) {
      var c = d.c;
      return '<div class="row" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; border: 1px solid #1d1f23">' +
        '<button data-act="toggle" data-v="' + c.id + '" role="checkbox" aria-checked="' + d.done + '" aria-label="Marcar como concluída" style="' + d.checkStyle + '">' + (d.done ? CHECK_ICON : '') + '</button>' +
        '<span style="' + d.titleStyle + '">' + esc(c.title) + '</span>' +
        '<span style="font-size: 12px; color: #8b8f97; white-space: nowrap">' + esc(c.client) + '</span>' +
        '<span style="font-size: 12px; color: #8b8f97; white-space: nowrap; width: 70px; text-align: right">' + esc(c.due) + '</span></div>';
    }) + '</div>';
  }

  function table(all) {
    var th = function (t) { return '<th style="padding: 10px 14px; font-weight: 500">' + t + '</th>'; };
    return '<div style="overflow-x: auto; border: 1px solid #222429; border-radius: 12px"><table style="width: 100%; min-width: 620px; border-collapse: collapse; font-size: 13px">' +
      '<thead><tr style="background: #0f1013; color: #8b8f97; font-size: 12px; text-align: left">' + ['Tarefa', 'Cliente', 'Programa', 'Status', 'Tempo', 'Prazo'].map(th).join('') + '</tr></thead><tbody>' +
      each(all, function (d) {
        var c = d.c;
        return '<tr class="row" style="border-top: 1px solid #222429">' +
          '<td style="padding: 11px 14px">' + esc(c.title) + '</td>' +
          '<td style="padding: 11px 14px; color: #c3c6cc">' + esc(c.client) + '</td>' +
          '<td style="padding: 11px 14px; color: #c3c6cc">' + esc(c.prog) + '</td>' +
          '<td style="padding: 11px 14px"><span style="display: inline-flex; align-items: center; gap: 6px; color: #c3c6cc"><span style="width: 7px; height: 7px; border-radius: 50%; background: ' + DOT[c.col] + '"></span>' + d.status + '</span></td>' +
          '<td class="tnum" style="padding: 11px 14px; color: #c3c6cc">' + (d.running ? timeSpan() : esc(c.spent)) + '</td>' +
          '<td style="padding: 11px 14px; color: #8b8f97">' + esc(c.due) + '</td></tr>';
      }) + '</tbody></table></div>';
  }

  function pageTasks(all) {
    var body = state.view === 'kanban' ? kanban(all) : state.view === 'list' ? list(all) : table(all);
    return '<div style="display: flex; flex-direction: column; gap: 16px; height: 100%">' +
      '<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap"><span style="font-size: 18px; font-weight: 600">Tarefas</span>' +
      '<div role="tablist" aria-label="Visão" style="display: flex; gap: 4px; padding: 3px; background: #0a0b0c; border-radius: 10px">' +
      each([['kanban', 'Kanban'], ['list', 'Lista'], ['table', 'Tabela']], function (v) {
        return '<button class="seg" role="tab" aria-selected="' + (state.view === v[0]) + '" data-act="view" data-v="' + v[0] + '" style="' + segStyle(state.view === v[0]) + '">' + v[1] + '</button>';
      }) + '</div></div>' + body + '</div>';
  }

  function pageCal() {
    var hh = function (x) { return Math.floor(x) + 'h' + (x % 1 ? '30' : ''); };
    return '<div style="display: flex; flex-direction: column; gap: 16px">' +
      '<div style="display: flex; justify-content: space-between; align-items: center"><span style="font-size: 18px; font-weight: 600">Semana</span><span style="font-size: 12px; color: #8b8f97">9h – 18h</span></div>' +
      '<div style="display: grid; grid-template-columns: repeat(5, minmax(110px, 1fr)); gap: 8px; overflow-x: auto">' +
      each(DAYS, function (d) {
        return '<div style="display: flex; flex-direction: column; gap: 8px">' +
          '<span style="font-size: 12px; text-align: center; padding: 6px; border-radius: 8px; ' + (d.today ? 'background: rgba(79,179,156,0.14); color: #7fd4bf; font-weight: 600' : 'color: #8b8f97') + '">' + d.label + '</span>' +
          '<div style="position: relative; height: 380px; border-radius: 10px; background: repeating-linear-gradient(#0f1013 0 41px, #1a1b1f 41px 42px)">' +
          each(d.events, function (e) {
            var c = EVC[e[4]];
            return '<div style="position: absolute; left: 4px; right: 4px; top: ' + ((e[0] - 9) * 42 + 2) + 'px; height: ' + ((e[1] - e[0]) * 42 - 4) + 'px; border-radius: 8px; background: ' + c[0] + '; color: ' + c[1] + '; border-left: 0; box-shadow: inset 2px 0 0 ' + c[2] + '; padding: 6px 8px; box-sizing: border-box; font-size: 11px; display: flex; flex-direction: column; gap: 2px; overflow: hidden">' +
              '<span style="font-weight: 600">' + esc(e[2]) + '</span><span style="opacity: .8">' + hh(e[0]) + ' – ' + hh(e[1]) + ' · ' + esc(e[3]) + '</span></div>';
          }) + '</div></div>';
      }) + '</div></div>';
  }

  function pageNotes() {
    var n = NOTES[state.note];
    return '<div style="display: flex; gap: 16px; height: 100%; flex-wrap: wrap">' +
      '<div style="flex: 0 1 220px; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 18px; font-weight: 600; margin-bottom: 8px">Notas</span>' +
      each(NOTES, function (x, i) {
        return '<button class="side" data-act="note" data-v="' + i + '" style="display: flex; flex-direction: column; align-items: flex-start; gap: 2px; width: 100%; padding: 10px 12px; border: 0; border-radius: 10px; font-family: inherit; text-align: left; cursor: pointer; ' +
          (state.note === i ? 'background: #1f2024; color: #e7e8ea' : 'background: transparent; color: #c3c6cc') + '"><span style="font-size: 13px; font-weight: 500">' + esc(x.title) + '</span><span style="font-size: 11px; color: #8b8f97">' + esc(x.date) + '</span></button>';
      }) + '</div>' +
      '<div style="flex: 1 1 320px; min-width: 0; border-radius: 14px; background: #0a0b0c; border: 1px solid #222429; padding: 24px; display: flex; flex-direction: column; gap: 12px">' +
      '<span style="font-size: 20px; font-weight: 600; letter-spacing: -0.02em">' + esc(n.title) + '</span>' +
      '<span style="font-size: 12px; color: #8b8f97">' + esc(n.date) + '</span>' +
      '<span style="font-size: 14px; line-height: 1.7; color: #c3c6cc; white-space: pre-line">' + esc(n.body) + '</span></div></div>';
  }

  function barStyle(i) {
    var max = Math.max.apply(null, PROGS.map(function (p) { return p[state.range + 1]; }));
    var v = PROGS[i][state.range + 1];
    return 'display: block; height: 100%; border-radius: 5px; width: ' + Math.round((v / max) * 100) + '%; background: ' + (i === 0 ? '#4fb39c' : 'rgba(79,179,156,' + (0.85 - i * 0.14).toFixed(2) + ')');
  }

  function pageRep() {
    var avg = function (label, value) {
      return '<div style="border: 1px solid #222429; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 12px; color: #8b8f97">' + label + '</span><span style="font-size: 20px; font-weight: 600">' + value + '</span><span style="font-size: 11px; color: #8b8f97">média por job</span></div>';
    };
    return '<div style="display: flex; flex-direction: column; gap: 18px">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap"><span style="font-size: 18px; font-weight: 600">Tempo por programa</span>' +
      '<div role="tablist" aria-label="Período" style="display: flex; gap: 4px; padding: 3px; background: #0a0b0c; border-radius: 10px">' +
      each(['Semana', 'Mês'], function (label, i) {
        return '<button class="seg" role="tab" aria-selected="' + (state.range === i) + '" data-act="range" data-v="' + i + '" style="' + segStyle(state.range === i) + '">' + label + '</button>';
      }) + '</div></div>' +
      '<div style="display: flex; flex-direction: column; gap: 14px; background: #1a1b1f; border: 1px solid #222429; border-radius: 14px; padding: 20px">' +
      each(PROGS, function (p, i) {
        return '<div style="display: grid; grid-template-columns: 110px minmax(0, 1fr) 56px; gap: 12px; align-items: center; font-size: 13px">' +
          '<span style="color: #c3c6cc">' + p[0] + '</span>' +
          '<span style="height: 10px; border-radius: 5px; background: #0f1013; overflow: hidden"><span class="hbar" data-bar="' + i + '" style="' + barStyle(i) + '"></span></span>' +
          '<span class="tnum" data-bar-label="' + i + '" style="color: #8b8f97; text-align: right">' + p[state.range + 1] + 'h</span></div>';
      }) + '</div>' +
      '<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px">' + avg('Key visual', '4h 20m') + avg('Carrossel', '2h 50m') + avg('Reels editado', '3h 15m') + '</div>' +
      '<span style="font-size: 11px; color: #8b8f97">Dados de exemplo</span></div>';
  }

  function renderView() {
    var root = $('#app-view');
    var all = state.cards.map(decorate);
    var html = { home: pageHome, tasks: pageTasks, cal: pageCal, notes: pageNotes, rep: pageRep }[state.page](all);
    // a animação de entrada (.pg) só toca quando a página muda, como no original
    var animate = renderedPage !== state.page;
    renderedPage = state.page;
    root.innerHTML = '<div class="' + (animate ? 'pg' : '') + '" style="height: 100%">' + html + '</div>';
  }

  function set(patch) {
    var pageChanged = patch.page && patch.page !== state.page;
    Object.assign(state, patch);
    if (pageChanged) renderSide();
    renderView();
  }

  function moveCard(id, col) {
    state.cards = state.cards.map(function (c) { return c.id === id ? Object.assign({}, c, { col: col }) : c; });
    state.dragId = null; state.overCol = null;
    renderView();
  }

  // ---------- Relatórios: troca Semana/Mês animando as barras ----------
  function setRange(i) {
    if (state.range === i) return;
    state.range = i;
    $$('#app-view [data-act="range"]').forEach(function (b) {
      var on = Number(b.dataset.v) === i;
      b.setAttribute('style', segStyle(on)); b.setAttribute('aria-selected', on);
    });
    $$('#app-view [data-bar]').forEach(function (el) { el.setAttribute('style', barStyle(Number(el.dataset.bar))); });
    $$('#app-view [data-bar-label]').forEach(function (el) { el.textContent = PROGS[Number(el.dataset.barLabel)][i + 1] + 'h'; });
  }

  // ---------- Ilha ----------
  function setPhase(ph) {
    state.phase = ph;
    var island = $('#island'), sz = ISLAND[ph];
    if (!island) return;
    island.style.width = sz[0] + 'px';
    island.style.height = sz[1] + 'px';
    island.style.borderRadius = sz[2] + 'px';
    $$('[data-phase]', island).forEach(function (el) { el.dataset.on = String(Number(el.dataset.phase) === ph); });
  }

  // ---------- Scroll suave com motion blur ----------
  var raf = null;
  function scrollParent(el) {
    var p = el.parentElement;
    while (p && p !== document.body) {
      var oy = getComputedStyle(p).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight) return p;
      p = p.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }
  function smoothTo(id) {
    var target = document.getElementById(id);
    if (!target) return;
    var sc = scrollParent(target);
    var isDoc = sc === document.scrollingElement || sc === document.documentElement;
    var start = sc.scrollTop;
    var scTop = isDoc ? 0 : sc.getBoundingClientRect().top;
    var end = Math.max(0, target.getBoundingClientRect().top - scTop + start - (id === 'topo' ? 0 : 56));
    var dist = end - start;
    if (history.replaceState) history.replaceState(null, '', id === 'topo' ? location.pathname : '#' + id);
    if (Math.abs(dist) < 2) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { sc.scrollTop = end; return; }
    var dur = Math.min(1300, Math.max(650, Math.abs(dist) * 0.32));
    var content = document.getElementById('conteudo');
    var blurEl = document.getElementById('rytm-mblur');
    var maxBlur = CONFIG.blur;
    var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    var dease = function (t) { return t < 0.5 ? 12 * t * t : 3 * Math.pow(-2 * t + 2, 2); };
    if (raf) cancelAnimationFrame(raf);
    if (content && maxBlur > 0) { content.style.filter = 'url(#rytm-motion)'; content.style.willChange = 'filter'; }
    var t0 = performance.now();
    var step = function (now) {
      var t = Math.min(1, (now - t0) / dur);
      sc.scrollTop = start + dist * ease(t);
      var b = Math.min(maxBlur, Math.abs(dist) * dease(t) / dur * 0.9);
      if (blurEl) blurEl.setAttribute('stdDeviation', '0 ' + b.toFixed(2));
      if (t < 1) { raf = requestAnimationFrame(step); }
      else {
        if (blurEl) blurEl.setAttribute('stdDeviation', '0 0');
        if (content) { content.style.filter = ''; content.style.willChange = ''; }
        raf = null;
      }
    };
    raf = requestAnimationFrame(step);
  }

  // ---------- Eventos ----------
  function bind() {
    $$('[data-scroll]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); smoothTo(a.dataset.scroll); });
    });

    $('#island').addEventListener('click', function () { state.tick = 0; setPhase((state.phase + 1) % 4); });

    $('#side-items').addEventListener('click', function (e) {
      var b = e.target.closest('[data-act="page"]');
      if (b) set({ page: b.dataset.v });
    });

    var view = $('#app-view');
    view.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.dataset.act, v = b.dataset.v;
      if (act === 'view') set({ view: v });
      else if (act === 'note') set({ note: Number(v) });
      else if (act === 'range') setRange(Number(v));
      else if (act === 'next') {
        e.stopPropagation();
        var c = state.cards.find(function (x) { return x.id === v; });
        var i = colIndex(c.col);
        if (i < COLS.length - 1) moveCard(v, COLS[i + 1][0]);
      } else if (act === 'toggle') {
        var cc = state.cards.find(function (x) { return x.id === v; });
        moveCard(v, cc.col === 'ok' ? 'iniciar' : 'ok');
      }
    });

    // Arrastar cards entre colunas (estilos atualizados no lugar para não interromper o arraste)
    function paintCols() {
      $$('#app-view [data-col]').forEach(function (col) { col.setAttribute('style', colStyle(state.overCol === col.dataset.col)); });
    }
    view.addEventListener('dragstart', function (e) {
      var card = e.target.closest && e.target.closest('[data-card]');
      if (!card) return;
      try { e.dataTransfer.setData('text/plain', card.dataset.card); e.dataTransfer.effectAllowed = 'move'; } catch (err) {}
      state.dragId = card.dataset.card;
      card.style.opacity = '.35';
    });
    view.addEventListener('dragend', function (e) {
      var card = e.target.closest && e.target.closest('[data-card]');
      if (card && card.isConnected) {
        var c = state.cards.find(function (x) { return x.id === card.dataset.card; });
        card.style.opacity = c && c.col === 'ok' ? '.7' : '';
      }
      state.dragId = null; state.overCol = null; paintCols();
    });
    view.addEventListener('dragover', function (e) {
      var col = e.target.closest && e.target.closest('[data-col]');
      if (!col) return;
      e.preventDefault();
      if (state.overCol !== col.dataset.col) { state.overCol = col.dataset.col; paintCols(); }
    });
    view.addEventListener('dragleave', function (e) {
      var col = e.target.closest && e.target.closest('[data-col]');
      if (!col || col.contains(e.relatedTarget)) return;
      if (state.overCol === col.dataset.col) { state.overCol = null; paintCols(); }
    });
    view.addEventListener('drop', function (e) {
      var col = e.target.closest && e.target.closest('[data-col]');
      if (!col) return;
      e.preventDefault();
      var id = state.dragId;
      try { id = e.dataTransfer.getData('text/plain') || id; } catch (err) {}
      if (id) moveCard(id, col.dataset.col);
    });
  }

  // ---------- Relógio ----------
  function tick() {
    state.secs += 1;
    state.tick += 1;
    var t = fmt(state.secs);
    $$('[data-time]').forEach(function (el) { el.textContent = t; });
    if (CONFIG.autoplay && state.tick % 3 === 0) setPhase((state.phase + 1) % 4);
  }

  function init() {
    renderSide();
    renderView();
    setPhase(0);
    $$('[data-time]').forEach(function (el) { el.textContent = fmt(state.secs); });
    bind();
    setInterval(tick, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
